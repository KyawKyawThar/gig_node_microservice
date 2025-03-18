import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { orderService } from '@gateway/services/api/orderService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Get {
  public async getOrderId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await orderService.getOrderById(req.params.orderId);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.orderId });
    } catch (err) {
      next(err);
    }
  }
  public async sellerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await orderService.sellerOrder(req.params.sellerId);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.seller });
    } catch (err) {
      next(err);
    }
  }
  public async buyerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await orderService.buyerOrder(req.params.buyerId);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.buyer });
    } catch (err) {
      next(err);
    }
  }
  public async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await orderService.getNotifications(req.params.userTo);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data, notification: response.data.notifications });
    } catch (error) {
      next(error);
    }
  }
}
