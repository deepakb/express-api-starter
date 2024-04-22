export interface Config {
  PORT: number;
  GOOGLE_AI_API_KEY: string;
}

export interface Repository {
  name: string;
  owner: string;
  url: string;
}

export interface RepositoryChunk {
  content: string;
  filePath: string;
  url: string;
}

export interface GithubUrlRequest {
  url: string;
}

export interface GithubResponse {
  message: string;
}

export interface ChatRequest {
  url: string;
  question: string;
}
