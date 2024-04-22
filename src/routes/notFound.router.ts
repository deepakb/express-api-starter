// notFoundRouter.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.use((req: Request, res: Response) => {
  res.status(404).send('Not Found');
});

export default router;
