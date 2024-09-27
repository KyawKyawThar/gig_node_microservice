import { Logger } from 'winston';
import { winstonLogger } from './logger';
import { config } from './config';
import mongoose from 'mongoose';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'Database', 'debug');

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(config.DATABASE_URL);
    logger.info('User service successfully connected to database....');
  } catch (err) {
    logger.error('Auth service- Unable to connect to database');
    logger.log('error', 'auth service databaseConnection method error', err);
  }
};
