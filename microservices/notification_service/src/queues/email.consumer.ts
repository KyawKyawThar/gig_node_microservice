import { Logger } from 'winston';
import { Channel, ConsumeMessage } from 'amqplib';

import { config } from '@notifications/config';
import { winstonLogger } from '@notifications/logger';
import { createConnection } from '@notifications/queues/connection';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationEmailConsumer', 'debug');

export async function consumeAuthEmailMessage(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      const createChannel = await createConnection();
      if (createChannel) channel = createChannel;
    }

    await channel.assertExchange(config.EMAIL_EXCHANGE_NAME, 'direct');
    const assertQueue = await channel.assertQueue(config.EMAIL_QUEUE_NAME, { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, config.EMAIL_EXCHANGE_NAME, config.EMAIL_ROUTING_KEY);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      //consume the message
      console.log(JSON.parse(msg!.content.toString()));
      if (msg) {
        //const message = JSON.parse(msg!.content.toString());

        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error', err);
  }
}

export async function consumeOrderEmailMessage(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      const createChannel = await createConnection();

      if (createChannel) channel = createChannel;
    }
    await channel.assertExchange(config.ORDER_EXCHANGE_NAME, 'direct');

    const assertQueue = await channel.assertQueue(config.ORDER_QUEUE_NAME, { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, config.ORDER_EXCHANGE_NAME, config.ORDER_ROUTING_KEY);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      console.log(JSON.parse(msg!.content.toString()));

      if (msg) {
        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.log('error', 'NotificationService OrderEmailConsumer consumeOrderEmailMessage() method error', err);
  }
}
