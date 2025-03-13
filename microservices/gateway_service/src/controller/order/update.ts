import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { orderService } from '@gateway/services/api/orderService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Update {
  public async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentIntentId, orderData } = req.body;
      const { orderId } = req.params;
      const response = await orderService.cancelOrder(paymentIntentId, orderId, orderData);

      logger.info(response.data.message);
      res.status(StatusCodes.CREATED).json({ message: response.data.message });
    } catch (err) {
      next(err);
    }
  }
  public async requestExtension(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const response = await orderService.requestDeleliveryExtension(orderId, req.body);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.order });
    } catch (err) {
      next(err);
    }
  }
  public async deliveryDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, type } = req.params;

      const response = await orderService.updaateDeleiveryExtension(type, orderId, req.body);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.order });
    } catch (err) {
      next(err);
    }
  }

  public async deliverOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;

      const response = await orderService.deliverOrder(orderId, req.body);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.order });
      logger.info(response.data.message);
    } catch (err) {
      next(err);
    }
  }
  public async approveOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const response = await orderService.approveOrder(orderId, req.body);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.order });
      logger.info(response.data.message);
    } catch (err) {
      next(err);
    }
  }
  public async markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.body;

      const response = await orderService.markNotificationAsRead(notificationId);
      res.status(StatusCodes.OK).json({ message: response.data.message, order: response.data.order });
      logger.info(response.data.message);
    } catch (err) {
      next(err);
    }
  }
}
