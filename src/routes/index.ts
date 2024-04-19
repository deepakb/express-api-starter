import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import sampleRouter from './sampleRouter';

export function startRoutes(app: Express): void {
  app.use('/', sampleRouter);
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
  const swaggerSpec = swaggerJSDoc(options);

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/swagger.json',
      },
    })
  );
}
