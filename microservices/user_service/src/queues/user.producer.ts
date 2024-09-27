import { Channel } from 'amqplib';
import { createConnection } from '@user/queues/connection';
import { Logger } from 'winston';
import { winstonLogger } from '@user/logger';
import { config } from '@user/config';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'user-service', 'debug');

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
  } catch (e) {}
};
