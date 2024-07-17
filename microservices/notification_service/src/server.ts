import { Application } from 'express';
import { Logger } from 'winston';
import http from 'http';

import { winstonLogger } from '@notifications/logger';
import { config } from '@notifications/config';
import { healthRoute } from '@notifications/router';
import { checkConnection } from '@notifications/elasticSearch';
import { createConnection } from '@notifications/queues/connection';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoute());
  startQueue();
  startElasticSearch();
}

async function startQueue(): Promise<void> {
  await createConnection();
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
