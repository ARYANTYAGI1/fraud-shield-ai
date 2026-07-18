import mongoose from 'mongoose';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fraud-shield';

  try {
    logger.info(`Connecting to MongoDB...`);
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
