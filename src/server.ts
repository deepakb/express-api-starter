import express, { Express } from 'express';
import bodyParser from 'body-parser';
import connect from './lib/db';
import logger from './lib/logger';
import { handleErrors } from './middlewares/errorHandler';
import { logRequests } from './middlewares/requestLogger';
import { startRoutes, startSwagger } from './routes';
import notFoundRouter from './routes/notFound.router';

export function createServer(): Express {
  const app = express();
  app.use(express.static('public'));
  app.use(bodyParser.json());

  connect();
  app.use(logRequests);
  startRoutes(app);
  startSwagger(app);
  app.use(notFoundRouter);
  app.use(handleErrors);

  return app;
}

export function startServer(app: Express, port: number): void {
  const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle promise rejections
  process.on(
    'unhandledRejection',
    (reason: Record<string, never> | null | undefined, promise: Promise<unknown>) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      logger.debug(promise);
    }
  );
}
