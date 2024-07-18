import { Application } from 'express';
import { Logger } from 'winston';
import http from 'http';

import { winstonLogger } from '@notifications/logger';
import { config } from '@notifications/config';
import { healthRoute } from '@notifications/router';
import { checkConnection } from '@notifications/elasticSearch';
import { createConnection } from '@notifications/queues/connection';
import { consumeAuthEmailMessage, consumeOrderEmailMessage } from './queues/email.consumer';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoute());
  startQueue();
  startElasticSearch();
}

async function startQueue(): Promise<void> {
  const connection = await createConnection();
  if (connection) {
    await consumeAuthEmailMessage(connection);
    await connection.assertExchange(config.EMAIL_EXCHANGE_NAME, 'direct');
    const authMessage = JSON.stringify({ name: 'nicholas', service: 'auth notification services' });
    connection.publish(config.EMAIL_EXCHANGE_NAME, config.EMAIL_ROUTING_KEY, Buffer.from(authMessage));

    await consumeOrderEmailMessage(connection);
    await connection.assertExchange(config.ORDER_EXCHANGE_NAME, 'direct');
    const orderMessage = JSON.stringify({ name: 'nicholas', service: 'order notification service' });
    connection.publish(config.ORDER_EXCHANGE_NAME, config.ORDER_ROUTING_KEY, Buffer.from(orderMessage));
  } else {
    logger.error('failed to create email consumer');
  }
}

function startElasticSearch(): void {
  checkConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    logger.info(`Worker with process id of ${process.pid} on notification server has started`);
    httpServer.listen(config.SERVER_PORT, () => {
      logger.info(`Notification server is running on port ${config.SERVER_PORT}`);
    });
  } catch (err) {
    logger.error('Start Server failed');
    logger.log('error', 'NotificationService startServer() method', err);
  }
}
