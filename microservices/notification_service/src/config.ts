import { Config } from '@notifications/types/envConfigTypes';

const dotenv = require('dotenv');

dotenv.config();
function createConfig(): Config {
  return {
    SERVER_PORT: process.env.SERVER_PORT!,
    NODE_ENV: process.env.NODE_ENV!,
    CLIENT_URL: process.env.CLIENT_URL!,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    EMAIL_EXCHANGE_NAME: process.env.EMAIL_EXCHANGE_NAME!,
    EMAIL_QUEUE_NAME: process.env.EMAIL_QUEUE_NAME!,
    EMAIL_ROUTING_KEY: process.env.EMAIL_ROUTING_KEY!,
    ORDER_EXCHANGE_NAME: process.env.ORDER_EXCHANGE_NAME!,
    ORDER_QUEUE_NAME: process.env.ORDER_QUEUE_NAME!,
    ORDER_ROUTING_KEY: process.env.ORDER_ROUTING_KEY!
  };
}

export const config = createConfig();
