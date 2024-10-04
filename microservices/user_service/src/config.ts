import dotenv from 'dotenv';
import { Config } from './types/envConfigTypes';

dotenv.config();
if (process.env.ENABLE_APM === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: 'user_service',
    serverURL: process.env.ELASTIC_APM_SERVER_URL,
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
    USER_SERVER_PORT: process.env.USER_SERVER_PORT!,
    NODE_ENV: process.env.NODE_ENV!,
    CLIENT_URL: process.env.CLIENT_URL!,
    API_GATEWAY_URL: process.env.API_GATEWAY_URL!,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_HOST: process.env.REDIS_HOST!,
    JWT_SECRET: process.env.JWT_SECRET!,
    GATEWAY_JWT_TOKEN: process.env.GATEWAY_JWT_TOKEN!,
    SALT_HASH: process.env.SALT_HASH!,
    BASE_PATH: process.env.BASE_PATH!,
    BUYER_BASE_PATH: process.env.BUYER_BASE_PATH!,
    SELLER_BASE_PATH: process.env.SELLER_BASE_PATH!,
    CLOUD_NAME: process.env.CLOUD_NAME!,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY!,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET!,
    SELLER: process.env.SELLER!,
    BUYER: process.env.BUYER!
  };
}

export const config = createConfig();
