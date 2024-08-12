import { Config } from '@auth/types/envConfigTypes';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.ENABLE_AMP === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: 'auth_service',
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
    AUTH_SERVER_PORT: process.env.AUTH_SERVER_PORT!,
    NODE_ENV: process.env.NODE_ENV!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    CLIENT_URL: process.env.CLIENT_URL!,
    API_GATEWAY_URL: process.env.API_GATEWAY_URL!,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT!,
    DB_SOURCE: process.env.DB_SOURCE!,
    JWT_SECRET: process.env.JWT_SECRET!,
    GATEWAY_JWT_TOKEN: process.env.GATEWAY_JWT_TOKEN!,
    SALT_HASH: process.env.SALT_HASH!,
    EMAIL_EXCHANGE_NAME: process.env.EMAIL_EXCHANGE_NAME!,
    EMAIL_QUEUE_NAME: process.env.EMAIL_QUEUE_NAME!,
    EMAIL_ROUTING_KEY: process.env.EMAIL_ROUTING_KEY!,
    BASE_PATH: process.env.BASE_PATH!,
    AUTH: process.env.AUTH!,
    CLOUD_NAME: process.env.CLOUD_NAME!,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY!,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET!
  };
}

export const config = createConfig();
