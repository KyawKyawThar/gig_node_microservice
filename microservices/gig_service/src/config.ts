import { Config } from '@gig/types/envConfigTypes';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.ENABLE_APM === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: 'gateway_service',
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
    GIG_SERVER_PORT: process.env.GIG_SERVER_PORT!,
    NODE_ENV: process.env.NODE_ENV!,
    SALT_HASH: process.env.SALT_HASH!,
    CLIENT_URL: process.env.CLIENT_URL!,
    CLOUD_NAME: process.env.CLOUD_NAME!,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY!,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET!,
    API_GATEWAY_URL: process.env.API_GATEWAY_URL!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    ELASTIC_APM_SERVER_URL: process.env.ELASTIC_APM_SERVER_URL!,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT!,
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_HOST: process.env.REDIS_HOST!,
    GATEWAY_JWT_TOKEN: process.env.GATEWAY_JWT_TOKEN!,
    JWT_SECRET: process.env.JWT_SECRET!,
    GIG_BASE_PATH: process.env.GIG_BASE_PATH!,
    GIGS: process.env.GIGS!
  };
}

export const config = createConfig();
