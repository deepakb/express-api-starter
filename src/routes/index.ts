import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import sampleRouter from './sample.router';
import githubRouter from './github.router';

export function startRoutes(app: Express): void {
  app.use('/', sampleRouter);
  app.use('/github', githubRouter);
}

export function startSwagger(app: Express): void {
  const options: swaggerJSDoc.Options = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Express Rest API',
        version: '1.0.0',
        description: 'Express Rest API'
      }
    },
    apis: ['../routes/*.ts']
  };

  //TODO: See how to use swaggerSpec
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const swaggerSpec = swaggerJSDoc(options);

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/swagger.json'
      }
    })
  );
}
