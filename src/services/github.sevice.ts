import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import axios from 'axios';
import GitUrlParse from 'git-url-parse';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import Repository from '../models/repository.model';
import Chunk from '../models/chunk.model';
import logger from '../lib/logger';
import { RepositoryChunk } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config';

export class GithubService {
  async chatToRepositoryData(url: string, question: string) {
    try {
      const documents = await Chunk.getAllChunksByUrl(url);

      if (!documents) {
        return { answer: "Couldn't find the document." };
      }

      const formattedContent = [];
      for (const doc of documents) {
        formattedContent.push(doc.content);
      }
      const allCodesContent = formattedContent.join('\n\n');

      // Format prompt for Gemini AI
      const prompt = `
        You are asked with answering questions based on the contents of a document.
        ${allCodesContent}

        Sources:
        ${url}

        Question:
        ${question}

        Answer:
        `;

      const genAI = new GoogleGenerativeAI(CONFIG.GOOGLE_AI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(text);
    } catch (error) {
      logger.error('Error saving repository data:', error);
      throw error;
    }
  }

  async storeRepositoryData(url: string): Promise<void> {
    try {
      const parsedUrl = this.parseUrl(url);
      const { name, owner } = parsedUrl;
      const response = await axios.get(`https://api.github.com/repos/${owner}/${name}`);
      const { clone_url } = response.data;
      const clonedRepo = await this.cloneRepo(clone_url);
      const chunks = await this.getSummaryChunks(clonedRepo, url);

      const newRepository = new Repository({
        name,
        owner,
        url
      });

      await newRepository.save();
      this.saveChunks(chunks);
    } catch (error) {
      logger.error('Error saving repository data:', error);
      throw error;
    }
  }

  private parseUrl(url: string): { owner: string; name: string } {
    try {
      const parsedUrl = GitUrlParse(url);

      if (!parsedUrl.name) {
        throw new Error('Invalid Git URL format');
      }

      const { name, owner } = parsedUrl;
      return { owner, name };
    } catch (error) {
      logger.error('Error parsing Git URL:', error);
      throw error;
    }
  }

  private async cloneRepo(codeUrl: string): Promise<string> {
    const tempDir = await fs.mkdtemp(`${tmpdir()}/github-repo-`);
    const gitClone = spawn('git', ['clone', codeUrl, tempDir]);

    return await new Promise((resolve, reject) => {
      gitClone.stdout.on('data', data => {
        logger.info(`git clone output: ${data.toString()}`);
      });

      gitClone.stderr.on('data', data => {
        logger.error(`git clone error: ${data.toString()}`);
      });

      gitClone.on('close', code => {
        if (code === 0) {
          resolve(tempDir);
        } else {
          reject(new Error(`git clone failed with code: ${code}`));
        }
      });
    });
  }

  private async getSummaryChunks(codePath: string, url: string): Promise<Array<RepositoryChunk>> {
    const loader = new DirectoryLoader(codePath, {
      '.ts': path => new TextLoader(path),
      '.js': path => new TextLoader(path),
      '.json': path => new TextLoader(path),
      '.css': path => new TextLoader(path),
      '.md': path => new TextLoader(path)
    });
    const documents = await loader.load();
    logger.info(`Loaded ${documents.length} documents`);
    const splitters = {
      js: RecursiveCharacterTextSplitter.fromLanguage('js', { chunkSize: 2000, chunkOverlap: 0 }),
      markdown: RecursiveCharacterTextSplitter.fromLanguage('markdown', { chunkSize: 2000, chunkOverlap: 0 })
    };

    const chunks = [];
    for (const doc of documents) {
      let splitter;
      const fileName = this.getProjectPath(doc.metadata.source, true);
      const extension = path.extname(fileName);
      if (extension === '.md') {
        splitter = splitters['markdown'];
      } else {
        splitter = splitters['js'];
      }

      if (fileName !== 'package-lock.json') {
        const texts = await splitter.splitDocuments([doc]);
        for (const text of texts) {
          const content = text.pageContent;
          const filePath = this.getProjectPath(text.metadata.source);
          chunks.push({ content, filePath, url });
        }
      }
    }

    return chunks;
  }

  private async saveChunks(chunks: Array<RepositoryChunk>): Promise<void> {
    await Chunk.insertMany(chunks);
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
