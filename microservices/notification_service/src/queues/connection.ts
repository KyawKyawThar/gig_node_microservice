import { config } from '@notifications/config';
import { winstonLogger } from '@notifications/logger';
import amqplib, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServiceQueue', 'debug');

console.log(config);
export async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await amqplib.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    logger.info('Notification server was created connection to channel successfully...');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    logger.log('error', 'Notification service error createConnection() Method', error);
    return undefined;
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}
