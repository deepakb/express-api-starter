import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  MONGODB_URI: process.env.MONGODB_ENDPOINT,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME
};

export default DB_CONFIG;
