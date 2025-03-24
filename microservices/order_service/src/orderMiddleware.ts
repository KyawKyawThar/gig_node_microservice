import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { config } from '@order/config';
import { NotAuthorizedError } from '@order/errorHandler';

export function verifyOrderGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers?.gatewaytoken as string;

  if (!token) {
    return next(new NotAuthorizedError('Token is not valid from api gateway', 'verifyAuthGatewayRequest() method'));
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.ORDER) {
      return next(new NotAuthorizedError('Request is not for order service', 'verifyOrderGatewayRequest() method'));
    }
  } catch (error) {
    return next(new NotAuthorizedError('Request payload is invalid', 'verifyOrderGatewayRequest() method'));
  }

  next();
}
