import { config } from '@chats/config';
import { winstonLogger } from '@chats/logger';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from './connection';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chat-service', 'debug');

export const publicDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  if (!channel) {
    channel = (await createConnection()) as Channel;
  }

  await channel.assertExchange(exchangeName, 'direct');
  channel.publish(exchangeName, routingKey, Buffer.from(message));
  logger.info(logMessage);
};
