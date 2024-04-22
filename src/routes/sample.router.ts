import { Router, Request, Response } from 'express';
import SampleController from '../controllers/sample.controller';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const sample = new SampleController();
  const message = await sample.get();
  res.status(200).json(message);
});

export default router;
