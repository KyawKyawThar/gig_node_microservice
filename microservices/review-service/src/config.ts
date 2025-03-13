import dotenv from 'dotenv';
import * as process from 'node:process';
import { Config } from '@review/type/envConfigTypes';

dotenv.config();

if (process.env.ENABLE_APM === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: 'review_service',
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    environment: process.env.NODE_ENV,
    active: true,
    captureBody: 'all',
    errorOnAbortedRequests: true,
    captureErrorLogStackTraces: true
  });
}

function createConfig(): Config {
  return {
    ENABLE_APM: process.env.ENABLE_APM!,
    NODE_ENV: process.env.NODE_ENV!,
    CLIENT_URL: process.env.CLIENT_URL!,
    API_GATEWAY_URL: process.env.PROCESS_GATEWAY_URL!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    ELASTIC_APM_SERVER_URL: process.env.ELASTIC_APM_SERVER_URL!,
    REVIEW_SERVER_PORT: process.env.REVIEW_SERVER_PORT!,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT!,
    DATABASE_URL: process.env.DATABASE_URL!,
    GATEWAY_JWT_TOKEN: process.env.GATEWAY_JWT_TOKEN!,
    JWT_SECRET: process.env.JWT_SECRET!,
    REVIEW_BASE_PATH: process.env.REVIEW_BASE_PATH!,
    REVIEW: process.env.REVIEW!,
    DATABASE_USER: process.env.DATABASE_USER!,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD!,
    DATABASE_NAME: process.env.DATABASE_NAME!,
    CLUSTER_TYPE: process.env.CLUSTER_TYPE!,
    DATABASE_HOST: process.env.DB_HOST!,
    DATABASE_PORT: process.env.DB_PORT!
  };
}

export const config = createConfig();
