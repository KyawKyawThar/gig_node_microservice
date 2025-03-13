import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { createConnection } from '@order/queue/connection';
import { updateOrderReview } from '@order/services/order.service';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order-service', 'debug');

export const consumerReviewFanoutMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'consumer-review';
    const queueName = 'consumer-review-queues';

    await channel.assertExchange(exchangeName, 'fanout');
    const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });

    await channel.bindQueue(assertQueue.queue, exchangeName, '');

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        await updateOrderReview(JSON.parse(msg!.content.toString()));
        channel.ack(msg!);
      }
    });
  } catch (err) {
    logger.log('error', 'order-service conumer consumerReviewFanoutMessages() method error:', err);
  }
};
