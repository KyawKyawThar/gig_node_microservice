import mongoose from 'mongoose';
import { config } from './config';
import { winstonLogger } from './logger';

const logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'Database', 'debug');

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(config.DATABASE_URL);
  } catch (error) {
    logger.error('chat-service Unable to connect to database');
    logger.log('error', 'chat-service database connection method error', error);
  }
};
