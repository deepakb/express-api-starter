import { Get, Route } from 'tsoa';

interface MessageResponse {
  message: string;
}

@Route('sample')
export default class SampleController {
  @Get('/')
  public async get(): Promise<MessageResponse> {
    return {
      message: 'hello world'
    };
  }
}
