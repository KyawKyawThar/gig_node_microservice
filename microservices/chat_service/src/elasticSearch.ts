import { Logger } from 'winston';
import { winstonLogger } from './logger';
import { config } from './config';
import { Client } from '@elastic/elasticsearch';

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL, 'chatServiceES', 'debug');

export const elasticSearchClient = new Client({ node: config.ELASTIC_SEARCH_URL });

export async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    logger.info('ChatService connecting to ElasticSearch.....');
  }

  try {
    const health = await elasticSearchClient.cluster.health({});
    logger.info(`ChatService ElasticSearch health check- ${health.status}`);
    isConnected = true;
  } catch (error) {
    logger.log('error', 'Chat service checkConnection() method error', error);
  }
}
