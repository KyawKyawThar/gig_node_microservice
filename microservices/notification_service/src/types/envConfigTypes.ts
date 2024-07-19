export interface Config {
  SERVER_PORT: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  RABBITMQ_ENDPOINT: string;
  APP_ICON: string;
  ELASTIC_SEARCH_URL: string;
  EMAIL_EXCHANGE_NAME: string;
  EMAIL_QUEUE_NAME: string;
  EMAIL_ROUTING_KEY: string;
  ORDER_EXCHANGE_NAME: string;
  ORDER_QUEUE_NAME: string;
  ORDER_ROUTING_KEY: string;
  SENDER_EMAIL: string;
  SENDER_PASSWORD: string;
  SMTP_PORT: string;
}
