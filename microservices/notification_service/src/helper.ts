import Email from 'email-templates';
import nodemailer from 'nodemailer';
import path from 'path';
import { Logger } from 'winston';

import { config } from '@notifications/config';
import { winstonLogger } from '@notifications/logger';
import { mailTransport } from '@notifications/types/mailTransportType';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationMailTransportHelper', 'debug');

export async function emailTemplate(template: string, receiver: string, mailTransport: mailTransport): Promise<void> {
  try {
    const smtpTransport = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: Number(config.SMTP_PORT),
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_PASSWORD
      }
    });

    const email = new Email({
      message: {
        from: `HL App from ${config.SENDER_EMAIL}`
      },
      transport: smtpTransport,
      send: true,
      preview: false,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        applyStyleTags: true,
        webResources: {
          relativeTo: path.join(__dirname, '../build')
        }
      }
    });

    await email.send({
      template: path.join(__dirname, './emails', template),
      message: {
        to: receiver
      },
      locals: mailTransport
    });
  } catch (err) {
    logger.error(err);
  }
}
