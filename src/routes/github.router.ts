import { Router, Request, Response } from 'express';
import GithubController from '../controllers/github.controller';

const router = Router();
const githubController = new GithubController();

router.post('/', async (req: Request, res: Response) => {
  try {
    const message = await githubController.storeGithubInfo(req.body);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error storing repository data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const message = await githubController.chatToGithub(req.body);
    res.status(200).json(message);
  } catch (error) {
    console.error('Error chating with repository:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
