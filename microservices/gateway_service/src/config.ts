import { Config } from '@gateway/types/envConfigType';
import dotenv from 'dotenv';
import * as process from 'node:process';

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
    GATEWAY_SERVER_PORT: process.env.GATEWAY_SERVER_PORT!,
    ENABLE_APM: process.env.ENABLE_APM!,
    NODE_ENV: process.env.NODE_ENV!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    CLIENT_BASE_URL: process.env.CLIENT_BASE_URL!,
    AUTH_BASE_URL: process.env.AUTH_BASE_URL!,
    MESSAGE_BASE_URL: process.env.MESSAGE_BASE_URL!,
    GATEWAY_JWT_TOKEN: process.env.GATEWAY_JWT_TOKEN!,
    GIG_BASE_URL: process.env.GIG_BASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    SECRET_KEY_ONE: process.env.SECRET_KEY_ONE!,
    SECRET_KEY_TWO: process.env.SECRET_KEY_TWO!,
    BASE_PATH: process.env.BASE_PATH!,
    USER_BASE_URL: process.env.USER_BASE_URL!,
    REVIEW_BASE_URL: process.env.REVIEW_BASE_URL!,
    REDIS_HOST: process.env.REDIS_HOST!,
    ORDER_BASE_URL: process.env.ORDER_BASE_URL!
  };
}

export const config = createConfig();
