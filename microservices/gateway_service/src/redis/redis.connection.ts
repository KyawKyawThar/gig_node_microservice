import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { createClient } from 'redis';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

type redisClient = ReturnType<typeof createClient>;
class RedisConnection {
  client: redisClient;

  constructor() {
    this.client = createClient({ url: config.REDIS_HOST });
  }

  public async createRedisConnection() {
    try {
      await this.client.connect();
      logger.info(`Gig service redis connection: ${await this.client.ping()}`);
      this.castError();
    } catch (error) {
      logger.error('error', 'gig-service createRedisConnection() method error', error);
    }
  }
  private castError() {
    this.client.on('error', (err: unknown) => logger.error('Redis Client Error', err));
  }
}

export const redisConnection = new RedisConnection();
