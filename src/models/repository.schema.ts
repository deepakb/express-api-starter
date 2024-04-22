import mongoose from 'mongoose';
import { Repository } from '../types';

const Schema = mongoose.Schema;

const repositorySchema = new Schema<Repository>(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    url: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default repositorySchema;
