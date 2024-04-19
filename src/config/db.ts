import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  MONGODB_URI: process.env.MONGODB_ENDPOINT
};

export default DB_CONFIG;
