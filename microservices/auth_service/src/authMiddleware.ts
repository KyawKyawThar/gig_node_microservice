import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { NotAuthorizedError } from './errorHandler';
import { config } from './config';

export function verifyAuthGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers?.gatewaytoken as string;

  if (!token) {
    throw new NotAuthorizedError('Token is not valid from api gateway', 'verifyAuthGatewayRequest() method');
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.AUTH) {
      return new NotAuthorizedError('Request is not for auth service', 'verifyAuthGatewayRequest() method');
    }
  } catch (error) {
    throw new NotAuthorizedError('Request payload is invalid', 'verifyAuthGatewayRequest() method');
  }

  next();
}
