import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '@user/errorHandler';

import JWT from 'jsonwebtoken';
import { config } from './config';

export function verifySellerGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.gatewayToken as string;
  if (!token) {
    throw new NotAuthorizedError('Invalid request', 'verifySellerGatewayRequest() method: Token is not valid from api gateway');
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.SELLER) {
      return new NotAuthorizedError('Invalid request', 'verifyAuthGatewayRequest() method: Request is not for auth service');
    }
  } catch (error) {
    throw new NotAuthorizedError('Invalid request', 'verifySellerGatewayRequest() method: Request payload is invalid');
  }

  next();
}

export function verifyBuyerGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  if (!req.headers.gatewayToken) {
    throw new NotAuthorizedError('Invalid request', 'verifyBuyerGatewayRequest() method: Request not coming from api gateway');
  }

  const token = req.headers.gatewayToken as string;

  if (!token) {
    throw new NotAuthorizedError('Invalid request', 'verifyBuyerGatewayRequest() method: Token is not valid from api gateway');
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.BUYER) {
      return new NotAuthorizedError('Invalid request', 'verifyBuyerGatewayRequest() method: Request is not for auth service');
    }
  } catch (error) {
    throw new NotAuthorizedError('Invalid request', 'verifyBuyerGatewayRequest() method: Request payload is invalid');
  }

  next();
}
