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
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange('email-notification', 'direct');
    const assertQueue = await channel.assertQueue('auth-email-queue', { durable: true, autoDelete: false });
    await channel.bindQueue('auth-email-queue', 'email-notification', 'auth-email-key');

    await channel.consume(assertQueue.queue, async (msg: ConsumeMessage | null) => {
      //consume the message
      //msg is coming from connection.publish from server.ts

      if (msg) {
        const { receiverEmail, username, template, verifyLink, resetLink, otp } = JSON.parse(msg!.content.toString());

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
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange('order-notification', 'direct');

    const assertQueue = await channel.assertQueue('order-queue', { durable: true, autoDelete: false });
    await channel.bindQueue(assertQueue.queue, 'order-notification', 'order-key');

    await channel.consume(
      assertQueue.queue,
      async (msg: ConsumeMessage | null) => {
        if (msg) {
          // console.log('noti in msg....', msg);
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
          //console.log('notification service email consumer:', template, receiverEmail);
          const mailTransport: mailTransport = {
            appLink: `${config.CLIENT_URL}`,
            // appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
            appIcon: `${config.APP_ICON}`,
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
      },
      { noAck: false }
    );
  } catch (err) {
    logger.log('error', 'NotificationService OrderEmailConsumer consumeOrderEmailMessage() method error', err);
  }
}
