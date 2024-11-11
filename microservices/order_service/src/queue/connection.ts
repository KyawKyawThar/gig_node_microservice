import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import amqplib, { Channel, Connection } from 'amqplib';

const logger = winstonLogger(config.ELASTIC_SEARCH_URL, 'orderServiceQueue', 'debug');

export async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await amqplib.connect(config.RABBITMQ_ENDPOINT);

    const channel = await connection.createChannel();
    logger.info('Order service was successfully connected to rabbitMQ channel');
    closeConnection(connection, channel);
    return channel;
  } catch (error) {
    logger.log('error', 'Order service queue error createConnection() Method', error);
  }
}

function closeConnection(connection: Connection, channel: Channel): void {
  process.on('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}
