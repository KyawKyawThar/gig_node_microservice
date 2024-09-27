import dotenv from 'dotenv';

import { Config } from './types/envConfigTypes';

dotenv.config();
if (process.env.ENABLE_AMP === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: 'notification_service',
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
    SERVER_PORT: process.env.SERVER_PORT!,
    NODE_ENV: process.env.NODE_ENV!,
    CLIENT_URL: process.env.CLIENT_URL!,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT!,
    APP_ICON: process.env.APP_ICON!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    EMAIL_EXCHANGE_NAME: process.env.EMAIL_EXCHANGE_NAME!,
    EMAIL_QUEUE_NAME: process.env.EMAIL_QUEUE_NAME!,
    EMAIL_ROUTING_KEY: process.env.EMAIL_ROUTING_KEY!,
    ORDER_EXCHANGE_NAME: process.env.ORDER_EXCHANGE_NAME!,
    ORDER_QUEUE_NAME: process.env.ORDER_QUEUE_NAME!,
    ORDER_ROUTING_KEY: process.env.ORDER_ROUTING_KEY!,
    SENDER_EMAIL: process.env.SENDER_EMAIL!,
    SENDER_PASSWORD: process.env.SENDER_PASSWORD!,
    SMTP_PORT: process.env.SMTP_PORT!
  };
}

export const config = createConfig();
