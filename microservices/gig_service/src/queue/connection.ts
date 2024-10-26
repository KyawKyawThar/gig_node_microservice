import { winstonLogger } from '@gig/logger';
import { Logger } from 'winston';
import { config } from '@gig/config';

import amqplib, { Channel, Connection } from 'amqplib';

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL, 'gigServiceQueue', 'debug');

export async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await amqplib.connect(config.RABBITMQ_ENDPOINT);

    const channel = await connection.createChannel();
    logger.info('Gig service was successfully connected to rabbitMQ channel');
    closeConnection(connection, channel);
    return channel;
  } catch (error) {
    logger.log('error', 'Gig service queue error createConnection() Method', error);
  }
}
function closeConnection(connection: Connection, channel: Channel): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}
