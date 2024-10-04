import { NextFunction, Request, Response } from 'express';
import { UnAuthorizedError } from './errorHandler';
import { JWT, verify } from 'jsonwebtoken';

export function gigGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.headers?.gatewayToken as string;
    if (!token) {
      throw new UnAuthorizedError(
        'Invalid gateway token',
        'Invalid gigGatewayRequest() method: Token is not a valid from api gateway token'
      );
    }

    JWT.verify();
  } catch (err) {}
  next();
}
