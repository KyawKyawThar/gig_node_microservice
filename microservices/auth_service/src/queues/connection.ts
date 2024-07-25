import { config } from '@auth/config';
import { winstonLogger } from '@auth/logger';
import { Logger } from 'winston';
import amqplib, { Channel, Connection } from 'amqplib';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceQueue', 'debug');

export async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await amqplib.connect(config.RABBITMQ_ENDPOINT);

    const channel: Channel = await connection.createChannel();

    logger.info('Authentication service was created connection to channel successfully...');
    closeConnection(connection, channel);
    return channel;
  } catch (err) {
    logger.log('error', 'Authentication service error createConnection() Method', err);
    return undefined;
  }
}

function closeConnection(connection: Connection, channel: Channel): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}
