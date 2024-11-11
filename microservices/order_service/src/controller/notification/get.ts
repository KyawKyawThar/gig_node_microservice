import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { NextFunction, Request, Response } from 'express';
import { getNotificationsById } from '@order/services/notification.service';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order_service', 'debug');

export const notification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userToId } = req.params;
    const result = await getNotificationsById(userToId);

    res.status(StatusCodes.OK).json({ message: 'Notifications', notification: result });

    logger.info('order_service get notifications successfully');
  } catch (error) {
    next(error);
  }
};
