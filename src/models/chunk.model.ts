import mongoose from 'mongoose';
import chunkSchema from './chunk.schema';
import { RepositoryChunk } from '../types';

export interface ChunkModel extends mongoose.Model<RepositoryChunk> {
  // eslint-disable-next-line no-unused-vars
  getAllChunksByUrl(url: string): Promise<Array<RepositoryChunk>>;
}

const Chunk = mongoose.model<RepositoryChunk, ChunkModel>('Chunk', chunkSchema);

Chunk.getAllChunksByUrl = async function (url: string): Promise<Array<RepositoryChunk>> {
  try {
    const chunk = await this.find({ url });
    return chunk;
  } catch (error) {
    console.error('Error fetching document:', error);
    return [];
  }
};

export default Chunk;
