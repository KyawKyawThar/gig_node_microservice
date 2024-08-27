export interface Config {
  USER_SERVER_PORT: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  API_GATEWAY_URL: string;
  RABBITMQ_ENDPOINT: string;
  ELASTIC_SEARCH_URL: string;
  DATABASE_URL: string;
  REDIS_HOST: string;
  JWT_SECRET: string;
  GATEWAY_JWT_TOKEN: string;
  SALT_HASH: string;
  BASE_PATH: string;
  BUYER_BASE_PATH: string;
  SELLER_BASE_PATH: string;
  CLOUD_NAME: string;
  CLOUD_API_KEY: string;
  CLOUD_API_SECRET: string;
}
