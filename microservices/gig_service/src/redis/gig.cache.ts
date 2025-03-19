import { Logger } from 'winston';
import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { client } from './redis.connection';
const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL, 'gigRedisCache', 'debug');

//Cached user selected categories..
export const getUserSelectedCache = async (key: string): Promise<string> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const response = (await client.get(key)) as string;
    return response;
  } catch (error) {
    logger.error('error', 'getUserSelectedCache() method error', error);
    return '';
  }
};
