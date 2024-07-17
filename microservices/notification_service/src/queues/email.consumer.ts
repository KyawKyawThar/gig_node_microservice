import { Logger } from 'winston';
import { Channel, ConsumeMessage } from 'amqplib';

import { config } from '@notifications/config';
import { winstonLogger } from '@notifications/logger';
import { createConnection } from '@notifications/queues/connection';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationEmailConsumer', 'debug');

async function consumeAuthEmailMessage(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      const createChannel = await createConnection();
      if (createChannel) channel = createChannel;
    }

    const exchangeName = 'email-notification';
    const queueName = 'auth-queue-name';
    const routingKey = 'auth-email-key';

    await channel.assertExchange(exchangeName, 'direct');
    const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

    channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      console.log(JSON.parse(msg!.content.toString()));
    });
  } catch (err) {
    logger.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error', err);
  }
}
