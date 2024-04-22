import mongoose from 'mongoose';
import { RepositoryChunk } from '../types';

const Schema = mongoose.Schema;

const chunkSchema = new Schema<RepositoryChunk>(
  {
    content: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    url: {
      type: String
    }
  },
  { timestamps: true }
);

export default chunkSchema;
