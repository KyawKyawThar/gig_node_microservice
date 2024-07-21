import { config } from '@notifications/config';
import { emailTemplate } from '@notifications/helper';
import { winstonLogger } from '@notifications/logger';
import { mailTransport } from '@notifications/types/mailTransportType';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationMailTransport', 'debug');

export async function sendEmail(template: string, receiveEmail: string, mailTransport: mailTransport): Promise<void> {
  try {
    emailTemplate(template, receiveEmail, mailTransport);
    logger.info('Sending email successfully', template, receiveEmail, mailTransport);
  } catch (err) {
    logger.log('error', 'NotificationService mailTransportor sendEmail() metohd error ', err);
  }
}
