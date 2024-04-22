import mongoose, { ConnectOptions } from 'mongoose';
import { DB_CONFIG } from '../config';
import logger from './logger';

const clientOptions = {
  dbName: DB_CONFIG.MONGO_DB_NAME
} as ConnectOptions;

let cachedConnection: typeof mongoose | null = null;

async function connect() {
  try {
    if (!cachedConnection) {
      if (DB_CONFIG.MONGODB_URI) {
        const connection = await mongoose.connect(DB_CONFIG.MONGODB_URI, clientOptions);
        logger.info(`MongoDB connected successfully`);
        cachedConnection = connection;
      } else {
        logger.error('MONGODB_URI is not defined in the configuration.');
        throw new Error('MONGODB_URI is not defined in the configuration.');
      }
    }

    //return cachedConnection!;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default connect;
