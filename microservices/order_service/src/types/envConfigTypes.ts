export interface Config {
  NODE_ENV: string;
  SALT_HASH: string;
  CLIENT_URL: string;
  CLOUD_NAME: string;
  CLOUD_API_KEY: string;
  CLOUD_API_SECRET: string;
  API_GATEWAY_URL: string;
  ELASTIC_SEARCH_URL: string;
  ELASTIC_APM_SERVER_URL: string;
  ORDER_SERVER_PORT: string;
  RABBITMQ_ENDPOINT: string;
  DATABASE_URL: string;
  GATEWAY_JWT_TOKEN: string;
  JWT_SECRET: string;
  ORDER_BASE_PATH: string;
  ORDER: string;
  STRIPE_API_KEY: string;
}
