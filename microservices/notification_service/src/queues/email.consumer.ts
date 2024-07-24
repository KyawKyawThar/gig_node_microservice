import { Logger } from 'winston';
import { Channel, ConsumeMessage } from 'amqplib';
import { config } from '@notifications/config';
import { winstonLogger } from '@notifications/logger';
import { createConnection } from '@notifications/queues/connection';
import { mailTransport } from '@notifications/types/mailTransportType';

import { sendEmail } from './mail.transport';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationEmailConsumer', 'debug');

export async function consumeAuthEmailMessage(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      const createChannel = await createConnection();
      if (createChannel) {
        channel = createChannel;
      }
    }

    await channel.assertExchange(config.EMAIL_EXCHANGE_NAME, 'direct');
    const assertQueue = await channel.assertQueue(config.EMAIL_QUEUE_NAME, { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, config.EMAIL_EXCHANGE_NAME, config.EMAIL_ROUTING_KEY);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      //consume the message

      //msg is coming from connection.publish from server.ts
      // console.log(JSON.parse(msg!.content.toString()));
      if (msg) {
        const { receiverEmail, username, verifyLink, resetLink, template, otp } = JSON.parse(msg!.content.toString());

        const mailTransport: mailTransport = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: `${config.APP_ICON}`,
          username,
          otp,
          verifyLink,
          resetLink
        };
        await sendEmail(template, receiverEmail, mailTransport);
        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error', err);
  }
}

//can also create consumeOfferEmailMessage
export async function consumeOrderEmailMessage(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      const createChannel = await createConnection();

      if (createChannel) {
        channel = createChannel;
      }
    }
    await channel.assertExchange(config.ORDER_EXCHANGE_NAME, 'direct');

    const assertQueue = await channel.assertQueue(config.ORDER_QUEUE_NAME, { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, config.ORDER_EXCHANGE_NAME, config.ORDER_ROUTING_KEY);

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      console.log(JSON.parse(msg!.content.toString()));

      if (msg) {
        const {
          receiverEmail,
          username,
          template,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        } = JSON.parse(msg!.content.toString());
        const mailTransport: mailTransport = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        };

        if (template === 'orderPlaced') {
          await sendEmail('orderPlaced', receiverEmail, mailTransport);
          await sendEmail('orderReceipt', receiverEmail, mailTransport);
        } else {
          await sendEmail(template, receiverEmail, mailTransport);
        }

        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.log('error', 'NotificationService OrderEmailConsumer consumeOrderEmailMessage() method error', err);
  }
}
