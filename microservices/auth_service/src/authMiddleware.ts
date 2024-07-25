import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { createNotAuthorizedError } from './errorHandler';
import { config } from './config';

export function verifyGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  if (!req.headers.gatewayToken) {
    createNotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
  }

  const token = req.headers?.gatewayToken as string;

  if (!token) {
    createNotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Token is not valid from api gateway');
  }

  const payload: { id: string; iat: number } = JWT.verify(token, config.JWT_SECRET) as { id: string; iat: number };

  if (payload.id !== config.AUTH) {
    createNotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request payload is invalid');
  }

  next();
}