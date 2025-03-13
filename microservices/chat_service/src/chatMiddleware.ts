import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '@chats/errorHandler';
import JWT from 'jsonwebtoken';
import { config } from './config';

export function verifyChatGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers?.gatewaytoken as string;

  if (!token) {
    return next(new NotAuthorizedError('Token is not valid from api gateway', 'verifyChatGatewayRequest() method'));
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.CHATS) {
      return next(new NotAuthorizedError('Request is not for chat service', 'verifyChatGatewayRequest() method'));
    }
  } catch (err) {
    return next(new NotAuthorizedError('Request payload is invalid', 'verifyChatGatewayRequest() method'));
  }

  next();
}
