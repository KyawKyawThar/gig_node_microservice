import { Config } from '@gateway/types/envConfigType';
import dotenv from 'dotenv';

dotenv.config();
function createConfig(): Config {
  return {
    GATEWAY_SERVER_PORT: process.env.GATEWAY_SERVER_PORT!,
    ENABLE_APM: process.env.ENABLE_APM!,
    NODE_ENV: process.env.NODE_ENV!,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL!,
    CLIENT_BASE_URL: process.env.CLIENT_BASE_URL!,
    AUTH_BASE_URL: process.env.AUTH_BASE_URL!,
    GATEWAY_JWT_TOKEN: process.env.GATEWAY_JWT_TOKEN!,
    JWT_TOKEN: process.env.JWT_TOKEN!,
    SECRET_KEY_ONE: process.env.SECRET_KEY_ONE!,
    SECRET_KEY_TWO: process.env.SECRET_KEY_TWO!
  };
}

export const config = createConfig();
