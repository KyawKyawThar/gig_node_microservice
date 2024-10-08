export interface Config {
  AUTH_SERVER_PORT: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  API_GATEWAY_URL: string;
  RABBITMQ_ENDPOINT: string;
  ELASTIC_SEARCH_URL: string;
  DB_SOURCE: string;
  JWT_SECRET: string;
  GATEWAY_JWT_TOKEN: string;
  SALT_HASH: string;
  EMAIL_EXCHANGE_NAME: string;
  EMAIL_QUEUE_NAME: string;
  EMAIL_ROUTING_KEY: string;
  BASE_PATH: string;
  AUTH: string;
  CLOUD_NAME: string;
  CLOUD_API_KEY: string;
  CLOUD_API_SECRET: string;
}
