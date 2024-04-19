import { NextFunction, Request, Response } from 'express';
import logger from '../lib/logger';

export function logRequests(req: Request, res: Response, next: NextFunction): void {
  logger.info(`${req.method} ${req.url}`);
  next();
}
