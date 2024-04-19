import mongoose, { ConnectOptions, Connection } from 'mongoose';
import { DB_CONFIG } from '../config';
import logger from './logger';

const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
} as ConnectOptions;

let cachedConnection: Connection | null = null;

async function connect(): Promise<Connection> {
  try {
    if (!cachedConnection || cachedConnection.readyState !== 1) {
      if (DB_CONFIG.MONGODB_URI) {
        const connection = await mongoose.createConnection(DB_CONFIG.MONGODB_URI, clientOptions);
        logger.info(`MongoDB connected successfully`);
        cachedConnection = connection;
      } else {
        logger.error('MONGODB_URI is not defined in the configuration.');
        throw new Error('MONGODB_URI is not defined in the configuration.');
      }
    }

    return cachedConnection!;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default connect;
