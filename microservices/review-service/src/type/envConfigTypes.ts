export interface Config {
  ENABLE_APM: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  API_GATEWAY_URL: string;
  ELASTIC_SEARCH_URL: string;
  ELASTIC_APM_SERVER_URL: string;
  REVIEW_SERVER_PORT: string;
  RABBITMQ_ENDPOINT: string;
  DATABASE_URL: string;
  GATEWAY_JWT_TOKEN: string;
  JWT_SECRET: string;
  REVIEW_BASE_PATH: string;
  REVIEW: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  CLUSTER_TYPE: string;
  DATABASE_HOST: string;
  DATABASE_PORT: string;
}
