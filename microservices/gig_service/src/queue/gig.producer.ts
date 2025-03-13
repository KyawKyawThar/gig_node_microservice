import { Channel } from 'amqplib';
import { createConnection } from './connection';
import { Logger } from 'winston';
import { winstonLogger } from '@gig/logger';
import { config } from '@gig/config';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig-service', 'debug');
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
  } catch (err) {
    logger.log('error', 'gigService publicDirectMessage() method error: ' + err);
  }
};
