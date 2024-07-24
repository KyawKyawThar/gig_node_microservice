import { Logger } from 'winston';
import { Client } from '@elastic/elasticsearch';
import { winstonLogger } from '@auth/logger';
import { config } from '@auth/config';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceElasticSearchServer', 'debug');

const elasticSearchClient = new Client({ node: `${config.ELASTIC_SEARCH_URL}` });

export async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      logger.info(`Auth Service ElasticSearch health check - ${health.status}`);
      isConnected = true;
    } catch (err) {
      logger.error('Connection to elasticsearch failed.Retrying...');
      logger.log('error', 'Auth Service checkConnection() method:', err);
    }
  }
}
