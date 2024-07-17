import { Config } from '@notifications/types/envConfigTypes';

const dotenv = require('dotenv');

dotenv.config();
function createConfig(): Config {
  return {
    SERVER_PORT: process.env.SERVER_PORT,
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL
  };
}

export const config = createConfig();
