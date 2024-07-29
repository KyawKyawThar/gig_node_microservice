import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { NotAuthorizedError } from './errorHandler';
import { config } from './config';

export function verifyGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  if (!req.headers.gatewaytoken) {
    throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
  }

  const token = req.headers?.gatewaytoken as string;

  if (!token) {
    throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Token is not valid from api gateway');
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };
    if (payload.id !== config.AUTH) {
      throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request is not for auth service');
    }
  } catch (error) {
    throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request payload is invalid');
  }

  next();
}
