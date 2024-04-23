import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

const CONFIG = {
  PORT: Number(process.env.PORT),
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY
} as Config;

export default CONFIG;
