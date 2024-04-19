import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

const CONFIG = {
  PORT: Number(process.env.PORT)
} as Config;

export default CONFIG;
