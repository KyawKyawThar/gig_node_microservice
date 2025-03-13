import { Logger } from 'winston';
import { config } from '@order/config';
import { winstonLogger } from '@order/logger';
import { Channel } from 'amqplib';
import { createConnection } from './connection';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order-service', 'debug');

export const publicDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    logger.info(logMessage);
  } catch (e) {
    logger.log('error', 'orderService publicDirectMessage() method error:', e);
  }
};
