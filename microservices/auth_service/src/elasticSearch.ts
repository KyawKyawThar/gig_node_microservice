import { Logger } from 'winston';
import { Client } from '@elastic/elasticsearch';
import { winstonLogger } from '@auth/logger';
import { config } from '@auth/config';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

import { IQueryList, ISearchResult, ISellerGig } from './types/authTypes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceElasticSearchServer', 'debug');

export const elasticSearchClient = new Client({ node: `${config.ELASTIC_SEARCH_URL}` });

export async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    logger.info('AuthService connecting to ElasticSearch...');
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

async function checkIndexIsExists(indexName: string): Promise<boolean> {
  const result = await elasticSearchClient.indices.exists({ index: indexName });

  if (result) {
    logger.info(`Index ${indexName} is already exists`);
  }
  return result;
}

export async function createIndex(indexName: string): Promise<void> {
  try {
    const isIndexExists = await checkIndexIsExists(indexName);

    if (!isIndexExists) {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      logger.info(`created index "${indexName}"`);
    }
  } catch (error) {
    logger.info(`An error occurred while creating ${indexName} index`);
    logger.log('error', 'Auth Service checkConnection() method:', error);
  }
}

export async function getDocumentByID(index: string, gigID: string): Promise<ISellerGig> {
  try {
    const result = await elasticSearchClient.get({ index, id: gigID });
    logger.info('get element by ID from elasticSearch.');
    return result._source as ISellerGig;
  } catch (error) {
    logger.log('error', 'Auth Service elasticSearch getElementByID() method: ', error);
    return {} as ISellerGig;
  }
}

export async function getGigsBySearch(
  index: string,
  queryList: IQueryList[],
  type: string,
  size: number,
  from: string
): Promise<ISearchResult> {
  try {
    const result = await elasticSearchClient.search({
      index,
      size,
      query: {
        bool: {
          must: [...queryList]
        }
      },
      sort: [{ sortId: type === 'forward' ? 'asc' : 'desc' }],
      ...(from !== '0' && { search_after: [from] })
    });
    return result.hits as ISearchResult;
  } catch (error) {
    logger.log('error', 'Auth Service elasticSearch getGigsBySearch() method', error);
    return {} as ISearchResult;
  }
}
