import { config } from '@auth/config';
import { winstonLogger } from '@auth/logger';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

import { createConnection } from './connection';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceQueue', 'debug');
export async function publicDirectMessage(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    logger.info(logMessage);
  } catch (err) {
    logger.log('error', 'AuthService provider publicDirectMessage() method error: ', err);
  }
}
