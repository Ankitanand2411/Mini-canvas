import mongoose from 'mongoose';
import { env } from './env.js';

export function connectDb() {
  return mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
}

export function disconnectDb() {
  return mongoose.disconnect();
}
