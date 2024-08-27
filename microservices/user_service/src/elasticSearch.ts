import { winstonLogger } from './logger';
import { config } from './config';

import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { Client } from '@elastic/elasticsearch';

const logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'userServiceElasticSearchServer', 'debug');

export const elasticSearchClient = new Client({ node: `${config.ELASTIC_SEARCH_URL}` });

export const checkConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    logger.info('UserService connecting to ElasticSearch...');

    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      logger.info(`User Service Elasticsearch health check - ${health.status}`);
      isConnected = true;
    } catch (err) {
      logger.error('Connection to elasticsearch failed.Retrying...');
      logger.log('error', 'User Service checkConnection() method:', err);
    }
  }
};
