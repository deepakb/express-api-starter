import { NextFunction, Request, Response } from 'express';
import logger from '../lib/logger';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export function handleErrors(err: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error(err.stack || err.message);
  res.status(500).send('Internal Server Error');
}
