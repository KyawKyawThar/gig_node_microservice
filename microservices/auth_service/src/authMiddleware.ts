import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { NotAuthorizedError } from './errorHandler';
import { config } from './config';

export function verifyAuthGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers?.gatewaytoken as string;

  if (!token) {
    return next(new NotAuthorizedError('Token is not valid from api gateway', 'verifyAuthGatewayRequest() method'));
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.AUTH) {
      return next(new NotAuthorizedError('Request is not for auth service', 'verifyAuthGatewayRequest() method'));
    }
  } catch (error) {
    //console.log('authMiddleware error', error);
    return next(new NotAuthorizedError('Request payload is invalid', 'verifyAuthGatewayRequest() method'));
  }

  next();
}
