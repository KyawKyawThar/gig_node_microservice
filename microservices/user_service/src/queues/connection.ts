import { config } from '@user/config';
import { winstonLogger } from '@user/logger';
import { Logger } from 'winston';
import amqplib, { Channel, Connection } from 'amqplib';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceQueue', 'debug');

export async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await amqplib.connect(config.RABBITMQ_ENDPOINT);

    const channel: Channel = await connection.createChannel();

    logger.info('User service was created connection to channel successfully...');
    closeConnection(connection, channel);
    return channel;
  } catch (err) {
    logger.log('error', 'User service error createConnection() Method', err);
    return undefined;
  }
}

function closeConnection(connection: Connection, channel: Channel): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}
