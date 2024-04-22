import { Post, Route, Body } from 'tsoa';
import { GithubService } from '../services/github.sevice';
import { ChatRequest, GithubResponse, GithubUrlRequest } from '../types';

const githubService = new GithubService();

@Route('github')
export default class GithubController {
  @Post('/')
  public async storeGithubInfo(@Body() request: GithubUrlRequest): Promise<GithubResponse> {
    const { url } = request;

    try {
      await githubService.storeRepositoryData(url);
      return { message: 'Repository metadata saved successfully' };
    } catch (error) {
      console.error('Error saving repository data:', error);
      return { message: 'Internal server error' };
    }
  }

  @Post('/chat')
  public async chatToGithub(@Body() request: ChatRequest): Promise<GithubResponse> {
    const { url, question } = request;

    try {
      await githubService.chatToRepositoryData(url, question);
      return { message: 'Repository metadata saved successfully' };
    } catch (error) {
      console.error('Error saving repository data:', error);
      return { message: 'Internal server error' };
    }
  }
}
