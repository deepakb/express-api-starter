import mongoose from 'mongoose';
import repositorySchema from './repository.schema';
import { Repository } from '../types';

export interface RepositoryModel extends mongoose.Model<Repository> {}

export default mongoose.model<Repository>('Repository', repositorySchema);
