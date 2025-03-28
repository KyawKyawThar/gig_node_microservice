import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { Channel, ConsumeMessage } from 'amqplib';

import { updateOrderReview } from '@order/services/order.service';
import { createOrderConnection } from '@order/queue/connection';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order-service', 'debug');

export const consumerReviewFanoutMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createOrderConnection()) as Channel;
    }

    const exchangeName = 'user-review-update';
    const queueName = 'consumer-review-queues';

    await channel.assertExchange(exchangeName, 'fanout');
    const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });

    await channel.bindQueue(assertQueue.queue, exchangeName, '');

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      //console.log('consumerReviewFanoutMessages', JSON.parse(msg!.content.toString()));
      if (msg) {
        await updateOrderReview(JSON.parse(msg!.content.toString()));
        channel.ack(msg!);
      }
    });
  } catch (err) {
    logger.log('error', 'order-service conumer consumerReviewFanoutMessages() method error:', err);
  }
};
