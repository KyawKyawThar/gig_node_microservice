import { winstonLogger } from '@review/logger';
import { config } from '@review/config';
import { reviewCreateConnection } from '@review/queue/connection';
import { Channel } from 'amqplib';

const logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewServiceProducer', 'debug');

export const publicFanOutMessage = async (channel: Channel, exchangeName: string, message: string, logMessage: string): Promise<void> => {
  try {
    if (!channel) {
      channel = (await reviewCreateConnection()) as Channel;
    }

    await channel.assertExchange(exchangeName, 'fanout');
    channel.publish(exchangeName, '', Buffer.from(message));
    logger.info(logMessage);
  } catch (error) {
    logger.log('error', 'ReviewService publishFanoutMessage() method:', error);
  }
};
