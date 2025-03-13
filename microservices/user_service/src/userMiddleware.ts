import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '@user/errorHandler';

import JWT from 'jsonwebtoken';
import { config } from './config';

export function verifySellerGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.gatewaytoken as string;
  if (!token) {
    return next(new NotAuthorizedError('Token is not valid from api gateway', 'verifySellerGatewayRequest() method '));
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.SELLER) {
      return next(new NotAuthorizedError('Request is not for user service', 'verifyAuthGatewayRequest() method: '));
    }
  } catch (error) {
    return next(new NotAuthorizedError('Request payload is invalid', 'verifySellerGatewayRequest() method'));
  }

  next();
}

export function verifyBuyerGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.gatewaytoken as string;

  if (!token) {
    return next(new NotAuthorizedError('Invalid request', 'verifyBuyerGatewayRequest() method: Token is not valid from api gateway'));
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.BUYER) {
      return next(new NotAuthorizedError('Invalid request', 'verifyBuyerGatewayRequest() method: Request is not for auth service'));
    }
  } catch (error) {
    return next(new NotAuthorizedError('Invalid request', 'verifyBuyerGatewayRequest() method: Request payload is invalid'));
  }

  next();
}
