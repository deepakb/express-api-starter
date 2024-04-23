import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import logger from '../lib/logger';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CONFIG, DB_CONFIG } from '../config';
import { MongoClient } from 'mongodb';
import { GithubRepoLoader } from 'langchain/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BufferMemory } from 'langchain/memory';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  AIMessagePromptTemplate,
  HumanMessagePromptTemplate
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';

export class GithubService {
  async chatToRepositoryData(url: string, question: string) {
    try {
      // Create the vector store first
      const client = new MongoClient(DB_CONFIG.MONGODB_URI || '');
      const namespace = 'github.repository';
      const [dbName, collectionName] = namespace.split('.');
      const collection = client.db(dbName).collection(collectionName);

      const vectorStore = new MongoDBAtlasVectorSearch(
        new OpenAIEmbeddings({ apiKey: CONFIG.OPEN_AI_API_KEY }),
        {
          collection,
          indexName: 'vector_index',
          textKey: 'content',
          embeddingKey: 'content_embedding'
        }
      );
      const retriever = await vectorStore.asRetriever({
        searchType: 'mmr',
        searchKwargs: {
          fetchK: 100,
          lambda: 0.1
        }
      });

      const model = new ChatOpenAI({ apiKey: CONFIG.OPEN_AI_API_KEY, model: 'gpt-3.5-turbo' }).pipe(
        new StringOutputParser()
      );
      const memory = new BufferMemory({
        returnMessages: true, // Return stored messages as instances of `BaseMessage`
        memoryKey: 'chat_history' // This must match up with our prompt template input variable.
      });
      const questionGeneratorTemplate = ChatPromptTemplate.fromMessages([
        AIMessagePromptTemplate.fromTemplate(
          "Given a GitHub repository description and a user's question about the code, rephrase the user's question to be a standalone question suitable for searching the codebase."
        ),
        new MessagesPlaceholder('chat_history'),
        AIMessagePromptTemplate.fromTemplate(`
          User Question: {question}\n
          Standalone Question for Code Search:\n
        `)
      ]);
      const combineDocumentsPrompt = ChatPromptTemplate.fromMessages([
        AIMessagePromptTemplate.fromTemplate(
          'The provided GitHub repository code is embedded in a vector space. Use the following pieces of context to answer the question at the end. Give answer valid to the respository codebase only and specific to it.\n\n{context}\n\n'
        ),
        new MessagesPlaceholder('chat_history'),
        HumanMessagePromptTemplate.fromTemplate('Question: {question}')
      ]);
      const combineDocumentsChain = RunnableSequence.from([
        {
          question: (output: string) => output,
          chat_history: async () => {
            const { chat_history } = await memory.loadMemoryVariables({});
            return chat_history;
          },
          context: async (output: string) => {
            const relevantDocs = await retriever.getRelevantDocuments(output);
            console.log({ relevantDocs });
            return formatDocumentsAsString(relevantDocs);
          }
        },
        combineDocumentsPrompt,
        model,
        new StringOutputParser()
      ]);

      const conversationalQaChain = RunnableSequence.from([
        {
          question: (i: { question: string }) => i.question,
          chat_history: async () => {
            const { chat_history } = await memory.loadMemoryVariables({});
            return chat_history;
          }
        },
        questionGeneratorTemplate,
        model,
        new StringOutputParser(),
        combineDocumentsChain
      ]);
      const result = await conversationalQaChain.invoke({
        question
      });
      console.log({ result });
    } catch (error) {
      logger.error('Error saving repository data:', error);
      throw error;
    }
  }

  async storeRepositoryData(url: string): Promise<void> {
    try {
      const documents = await this.loadGithubRepo(url);
      await this.createEmbeddings(documents);
    } catch (error) {
      logger.error('Error saving repository data:', error);
      throw error;
    }
  }

  private async loadGithubRepo(url: string) {
    // https://js.langchain.com/docs/integrations/document_loaders/web_loaders/github
    try {
      const loader = new GithubRepoLoader(url, {
        branch: 'master',
        recursive: true,
        processSubmodules: true,
        unknown: 'warn',
        maxConcurrency: 3,
        ignorePaths: ['node_modules/*', 'package-lock.json']
      });

      const docs = [];
      for await (const doc of loader.loadAsStream()) {
        docs.push(doc);
      }

      logger.info(`Loaded ${docs.length} documents`);
      return docs;
    } catch (error) {
      logger.error('Error loading Git URL:', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createEmbeddings(docs: Document<Record<string, any>>[]): Promise<void> {
    const splitters = {
      js: RecursiveCharacterTextSplitter.fromLanguage('js', { chunkSize: 2000, chunkOverlap: 0 }),
      markdown: RecursiveCharacterTextSplitter.fromLanguage('markdown', { chunkSize: 2000, chunkOverlap: 0 })
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunks = [];
    for (const doc of docs) {
      let splitter;
      const fileName = this.getProjectPath(doc.metadata.source, true);
      const extension = path.extname(fileName);
      if (extension === '.md') {
        splitter = splitters['markdown'];
      } else {
        splitter = splitters['js'];
      }

      const texts = await splitter.splitDocuments([doc]);
      chunks.push(...texts);
    }

    const client = new MongoClient(DB_CONFIG.MONGODB_URI || '');
    const namespace = 'github.repository';
    const [dbName, collectionName] = namespace.split('.');
    const collection = client.db(dbName).collection(collectionName);

    await MongoDBAtlasVectorSearch.fromDocuments(
      chunks,
      new OpenAIEmbeddings({ apiKey: CONFIG.OPEN_AI_API_KEY }),
      {
        collection,
        indexName: 'vector_index',
        textKey: 'content',
        embeddingKey: 'content_embedding'
      }
    );
  }

  private getProjectPath(filePath: string, fileName: boolean = false): string {
    // Find the index of "github-repo-" within the path
    const repoIndex = filePath.indexOf('github-repo-');

    // Check if "github-repo-" exists
    if (repoIndex === -1) {
      return "Path doesn't contain 'github-repo-'";
    }

    // Function to handle path separator (either "\" or "/")
    const getPathSeparator = () => {
      if (filePath.indexOf('\\') !== -1) {
        return '\\'; // Use backslash for Windows paths
      } else {
        return '/'; // Use forward slash for Unix-like paths
      }
    };

    // Get the path separator based on the actual path
    const pathSeparator = getPathSeparator();

    // Find the index of the next path separator after "github-repo-"
    const nextSeparatorIndex = filePath.indexOf(pathSeparator, repoIndex + 'github-repo-'.length);

    // Extract the remaining path starting after the next separator
    const remainingPath = filePath.slice(nextSeparatorIndex + 1);

    // If fileName is true, return only the filename
    if (fileName) {
      // Find the index of the last path separator
      const lastSeparatorIndex = remainingPath.lastIndexOf(pathSeparator);

      // Extract the filename from the remaining path
      const filename = remainingPath.slice(lastSeparatorIndex + 1);

      return filename;
    } else {
      // Otherwise, return the remaining path
      return remainingPath;
    }
  }
}
