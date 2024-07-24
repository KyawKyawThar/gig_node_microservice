import { Config } from '@auth/types/envConfigTypes';
import dotenv from 'dotenv';

dotenv.config();
function createConfig(): Config {
  return {
    AUTH_SERVER_PORT: process.env.AUTH_SERVER_PORT!,
    NODE_ENV: process.env.NODE_ENV!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    CLIENT_URL: process.env.CLIENT_URL!,
    API_GATEWAY_URL: process.env.API_GATEWAY_URL!,
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT!,
    DB_SOURCE: process.env.DB_SOURCE!,
    JWT_TOKEN: process.env.JWT!
  };
}

export const config = createConfig();
