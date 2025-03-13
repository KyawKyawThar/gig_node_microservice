import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { UnAuthorizedError } from './errorHandler';
import { config } from './config';

export function verifyGigGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.headers?.gatewaytoken as string;
    if (!token) {
      return next(new UnAuthorizedError('Token is not a valid from api gateway token', 'Invalid gigGatewayRequest() method'));
    }

    const payload = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.GIGS) {
      return next(new UnAuthorizedError('Request is not for gig service', 'verifyAuthGatewayRequest() method'));
    }
  } catch (err) {
    return next(new UnAuthorizedError('Request payload is invalid', 'gigGatewayRequest() method'));
  }
  next();
}
