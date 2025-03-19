import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { NextFunction, Request, Response } from 'express';
import {
  approveDeliveryDate,
  approveOrder,
  cancelOrder,
  rejectDeliveryDate,
  requestDeliveryExtension,
  sellerDeliverOrder
} from '@order/services/order.service';
import { orderUpdateSchema } from '@order/schema/order';
import { BadRequestError } from '@order/errorHandler';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import * as crypto from 'node:crypto';
import { IDeliveredWork } from '@order/types/orderTypes';
import { upload } from '@order/cloudinaryUpload';
import { UploadApiResponse } from 'cloudinary';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order-service', 'debug');

const stripe = new Stripe(config.STRIPE_API_KEY, { typescript: true });

export const cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('request cancelled is:', req.body.paymentIntentId);

    // throw new BadRequestError('this is custom error', 'Create order() method');
    await stripe.refunds.create({
      payment_intent: `${req.body.paymentIntentId}`
    });

    const { orderId } = req.params;
    const cancelData = req.body.orderData;

    await cancelOrder(orderId, cancelData);
    res.status(StatusCodes.OK).json({ message: 'Order Canceled Successfully' });
    logger.info('Order Canceled Successfully');
  } catch (err) {
    next(err);
  }
};
export const requestExtension = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = orderUpdateSchema.validate(req.body);
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'order-service requestExtension() method error');
    }

    const order = await requestDeliveryExtension(req.params.orderId, req.body);
    res.status(StatusCodes.OK).json({ message: 'Order delivery request', order });
    logger.info('Request Extension successfully');
  } catch (err) {
    next(err);
  }
};

export const deliveryDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, type } = req.params;

    if (type === 'approve') {
      const { error } = orderUpdateSchema.validate(req.body);
      if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'auth-service signUp create() method error');
      }
    }

    const order = type === 'approve' ? await approveDeliveryDate(orderId, req.body) : await rejectDeliveryDate(orderId);

    res.status(StatusCodes.OK).json({ message: 'Order delivery date extension', order });

    logger.info('Delivery Date has been update successfully');
  } catch (err) {
    next(err);
  }
};

export const buyerApproveOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await approveOrder(req.params.orderId, req.body);

    res.status(StatusCodes.OK).json({ message: 'Order approved successfully', order });

    logger.info('Order approved successfully');
  } catch (err) {
    next(err);
  }
};

export const deliverOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    let file = req.body.file;

    const randomBytes = crypto.randomBytes(20);

    const randomCharacters = randomBytes.toString('hex');

    let result: UploadApiResponse;
    if (file) {
      result = (req.body.fileType === 'zip' ? await upload(file, `${randomCharacters}.zip`) : await upload(file)) as UploadApiResponse;

      if (!result.public_id) {
        throw new BadRequestError('File upload error. Try again', 'Update deliverOrder() method');
      }

      file = result?.secure_url;
    }

    const data: IDeliveredWork = {
      file,
      fileType: req.body.fileType,
      message: req.body.message,
      fileName: req.body.fileName,
      fileSize: req.body.fileSize
    };
    const order = await sellerDeliverOrder(orderId, true, data);

    logger.info('Order delivery successfully', order);
    res.status(StatusCodes.OK).json({ message: 'Order delivered successfully.', order });
  } catch (err) {
    next(err);
  }
};
