export interface Config {
  SERVER_PORT: string | undefined;
  NODE_ENV: string | undefined;
  CLIENT_URL: string | undefined;
  RABBITMQ_ENDPOINT: string | undefined;
  ELASTIC_SEARCH_URL: string | undefined;
}
