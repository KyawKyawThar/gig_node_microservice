import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { createClient } from 'redis';

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL, 'gateway service', 'debug');

type redisClient = ReturnType<typeof createClient>;
class GatewayCache {
  client: redisClient;

  constructor() {
    this.client = createClient({ url: config.REDIS_HOST });
  }

  public async saveUserSelectedCategory(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.SET(key, value);
    } catch (error) {
      logger.error('error', 'GatewayService Cache saveUserSelectedCategory() method error:', error);
    }
  }

  public async saveLoggedInUserToCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const index: number | null = await this.client.LPOS(key, value);

      if (index === null) {
        await this.client.LPUSH(key, value);
        logger.info(`User ${value} added`);
      }

      const response: string[] = await this.client.LRANGE(key, 0, -1);

      return response;
    } catch (error) {
      logger.error('error', 'GatewayService Cache saveLoggedInUserToCache() method error:', error);
      return [];
    }
  }
  public async removeLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LREM(key, 1, value);
      logger.info(`User ${value} removed`);

      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      logger.error('error', 'GatewayService Cache removeLoggedInUserFromCache() method error:', error);
      return [];
    }
  }
  public async getLoggedInUsersFromCache(key: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      logger.error('error', 'GatewayService Cache getLoggedInUsersFromCache() method error:', error);
      return [];
    }
  }
}

export const gatewayCache = new GatewayCache();
