import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { markNotificationAsRead } from '@order/services/notification.service';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order_service', 'debug');
export const markSingleNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notificationId } = req.body;

    const result = await markNotificationAsRead(notificationId);
    res.status(StatusCodes.OK).send({ message: 'Notification updated successfully.', notification: result });

    logger.info('Single notification read is update successfully');
  } catch (error) {
    next(error);
  }
};
