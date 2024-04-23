import dotenv from 'dotenv';
import { DbConfig } from '../types';

dotenv.config();

const DB_CONFIG = {
  MONGODB_URI: process.env.MONGODB_ENDPOINT,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME
} as DbConfig;

export default DB_CONFIG;
