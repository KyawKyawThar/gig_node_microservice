import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from './connection';
import { gigSeedData } from '@gig/services/gig.service';
import { updateGigReview } from '@gig/services/gig.service';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'user-service', 'debug');

export const consumeGigDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const queueName = 'gig-update-queue';
    const exchangeName = 'user-update-gig';
    const routingKey = 'update-gigs';
    await channel.assertExchange(exchangeName, 'direct');
    const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });

    await channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const { gigReview } = JSON.parse(msg!.content.toString());

        await updateGigReview(JSON.parse(gigReview));
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.log('error', 'gigService consumeReviewDirectMessage() method error: ', error);
  }
};
export const consumeGigSeedDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'user-seed-gigs';
    const queueName = 'seed-gig-queue';
    const routingKey = 'seed-seller';

    await channel.assertExchange(exchangeName, 'direct');
    const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });

    await channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        //used seed data function from userService
        const { randomSeller, count } = JSON.parse(msg!.content.toString());

        await gigSeedData(randomSeller, count);
        channel.ack(msg!);
      } else {
        // console.log('code is run in else block');
      }
    });
  } catch (error) {
    logger.log('error', 'gigService consumeReviewDirectMessage() method error: ', error);
  }
};
