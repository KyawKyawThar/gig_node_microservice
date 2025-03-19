import { winstonLogger } from '@review/logger';
import { config } from '@review/config';
import amqplib, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewServiceQueue', 'debug');

export async function reviewCreateConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await amqplib.connect(config.RABBITMQ_ENDPOINT);

    const channel: Channel = await connection.createChannel();

    logger.info('Review service was created connection to channel successfully...');
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
