import { Logger } from 'winston';
import { winstonLogger } from '@user/logger';
import { config } from '@user/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { createConnection } from '@user/queues/connection';
import { IBuyerDocument, ISellerDocument } from '@user/types/sellerTypes';
import { createBuyer, updateBuyerPurchasedGigsProp } from '@user/services/buyer.service';
import {
  getRandomSeller,
  updateSellerCancelledJobsProp,
  updateSellerCompletedJobsProp,
  updateSellerOngoingJobsProp,
  updateSellerReview,
  updateTotalGigsCount
} from '@user/services/seller.service';
import { publicDirectMessage } from '@user/queues/user.producer';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'user-service', 'debug');

export const consumeBuyerDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'user-buyer-update';
    const routingKey = 'user-buyer';
    const queueName = 'user-buyer-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const { type, username, profilePicture, email, country, createdAt } = JSON.parse(msg!.content.toString());

        if (type === 'auth') {
          const buyer: IBuyerDocument = {
            username,
            profilePicture,
            email,
            country,
            purchasedGigs: [],
            createdAt
          };

          await createBuyer(buyer);
          logger.info('rabbit mq Buyer created successfully from auth service', buyer);
        } else {
          const { buyerId, purchasedGigs } = JSON.parse(msg!.content.toString());
          await updateBuyerPurchasedGigsProp(buyerId, purchasedGigs, type);
        }
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.log('error', 'UserService seller consumer consumeBuyerDirectMessage() method error: ', error);
  }
};

export const consumeSellerDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
      const exchangeName = 'user-seller-update';
      const routingKey = 'user-seller';
      const queueName = 'user-seller-queue';

      await channel.assertExchange(exchangeName, 'direct');
      const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

      await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
        if (msg) {
          const { type, count, sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = JSON.parse(msg!.content.toString());

          switch (type) {
            case 'create-order':
              await updateSellerOngoingJobsProp(sellerId, ongoingJobs);
              break;
            case 'update-gig-count':
              await updateTotalGigsCount(sellerId, count);
              break;
            case 'approve-order':
              await updateSellerCompletedJobsProp({ sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery });
              break;

            case 'cancel-order':
              await updateSellerCancelledJobsProp(sellerId);
              break;
          }
          channel.ack(msg);
        }
      });
    }
  } catch (error) {
    logger.log('error', 'UserService buyer consumeBuyerDirectMessage() method error:', error);
  }
};

export const consumeReviewFanoutDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
      const exchangeName = 'user-review-update';
      const queueName = 'user-review-queue';

      await channel.assertExchange(exchangeName, 'fanout');
      const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(assertQueue.queue, exchangeName, queueName);

      await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
        if (msg) {
          const buyerReview = JSON.parse(msg!.content.toString());

          if (buyerReview.type === 'buyer-review') {
            await updateSellerReview(buyerReview);

            await publicDirectMessage(
              channel,
              'user-update-gig',
              'update-gigs',
              JSON.stringify({ type: 'updateGig', gigReview: msg!.content.toString() }),
              'Message sent to gig service'
            );
          }
          channel.ack(msg);
        }
      });
    }
  } catch (error) {
    logger.log('error', 'UserService consumeReviewDirectMessage() method error: ', error);
  }
};

export const consumeSeedGigDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'user-seller-seed';
    const routingKey = 'seller-gig';
    const queueName = 'user-gig-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const assertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, exchangeName, routingKey);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const { type } = JSON.parse(msg!.content.toString());

        if (type === 'getSellers') {
          const { count } = JSON.parse(msg!.content.toString());
          const randomSeller: ISellerDocument[] = (await getRandomSeller(parseInt(count, 10))) as ISellerDocument[];

          await publicDirectMessage(
            channel,
            'user-seed-gigs',
            'seed-seller',
            JSON.stringify({ type: 'receiveSellers', randomSeller, count }),
            'Message sent to gig service'
          );
        }
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.log('error', 'UserService buyer consumeBuyerDirectMessage() method error:', error);
  }
};
