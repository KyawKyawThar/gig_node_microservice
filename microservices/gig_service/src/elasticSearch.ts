import { Logger } from 'winston';
import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { Client } from '@elastic/elasticsearch';
import { ISellerGig } from './types/gigTypes';

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL, 'gigServiceQueue', 'debug');

export const elasticSearchClient = new Client({ node: config.ELASTIC_SEARCH_URL });

export async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    logger.info('GigService connecting to ElasticSearch...');

    try {
      const health = await elasticSearchClient.cluster.health({});
      logger.info(`Gig Service ElasticSearch health check - ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.log('error', 'Gig service checkConnection() method error', error);
    }
  }
}

async function checkIndexIsExists(indexName: string): Promise<boolean> {
  return await elasticSearchClient.indices.exists({ index: indexName });
}

export async function createIndex(indexName: string): Promise<void> {
  try {
    const isExist = await checkIndexIsExists(indexName);
    if (isExist) {
      logger.info(`Index ${indexName} is already exists`);
    }
    await elasticSearchClient.indices.create({ index: indexName });
    await elasticSearchClient.indices.refresh({ index: indexName });
  } catch (error) {
    logger.error(`An error occurred while creating the index ${indexName}`);
    logger.log('error', 'GigService createIndex() method error:', error);
  }
}
export async function getDocumentCount(index: string): Promise<number> {
  try {
    const result = await elasticSearchClient.count({ index });
    return result.count;
  } catch (error) {
    logger.log('error', 'GigService elasticsearch getDocumentCount() method error:', error);
    return 0;
  }
}
export async function getIndexData(index: string, indexId: string): Promise<ISellerGig> {
  try {
    const result = await elasticSearchClient.get({ index, id: indexId });
    return result._source as ISellerGig;
  } catch (error) {
    logger.log('error', 'GigService elasticsearch getIndexData() method error:', error);
    return {} as ISellerGig;
  }
}
export async function addIndexData(indexName: string, indexId: string, gigDocument: unknown): Promise<void> {
  try {
    await elasticSearchClient.index({ index: indexName, id: indexId, document: gigDocument });
  } catch (error) {
    logger.log('error', 'GigService elasticsearch addIndexData() method error:', error);
  }
}
export async function updateIndexData(indexName: string, indexId: string, gigDocument: unknown): Promise<void> {
  try {
    await elasticSearchClient.update({ index: indexName, id: indexId, doc: gigDocument });
  } catch (error) {
    logger.log('error', 'GigService elasticsearch updateIndexData() method error:', error);
  }
}
export async function deleteIndexData(indexName: string, indexId: string): Promise<void> {
  try {
    await elasticSearchClient.delete({ index: indexName, id: indexId });
  } catch (error) {
    logger.log('error', 'GigService elasticsearch deleteIndexData() method error:', error);
  }
}
