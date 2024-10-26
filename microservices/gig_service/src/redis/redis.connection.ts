import { Logger } from 'winston';
import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { createClient } from 'redis';

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL, 'gigServiceQueue', 'debug');

type redisClient = ReturnType<typeof createClient>;

export const client: redisClient = createClient({ url: config.REDIS_HOST });

export const createRedisConnection = async () => {
  try {
    await client.connect();
    logger.info(`Gig service redis connection: ${await client.ping()}`);
    castError();
  } catch (error) {
    logger.error('error', 'gig-service createRedisConnection() method error', error);
  }
};

const castError = () => {
  client.on('error', (err: unknown) => logger.error('Redis Client Error', err));
};
