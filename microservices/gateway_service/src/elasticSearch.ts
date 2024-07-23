import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { Client } from '@elastic/elasticsearch';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

class ElasticSearch {
  private elasticSearchClient: Client;
  constructor() {
    this.elasticSearchClient = new Client({ node: `${config.ELASTIC_SEARCH_URL}` });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;

    while (!isConnected) {
      try {
        const health = await this.elasticSearchClient.cluster.health({});
        logger.info(`Gateway Service ElasticSearch health check - ${health.status}`);
        isConnected = true;
      } catch (err) {
        logger.error('Connection to elasticsearch failed.Retrying...');
        logger.log('error', 'Gateway Service checkConnection() method:', err);
      }
    }
  }
}

export const elasticSearch = new ElasticSearch();
