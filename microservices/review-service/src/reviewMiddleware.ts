import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { UnAuthorizedError } from '@review/errorHandler';
import { config } from '@review/config';

export function verifyReviewGatewayRequest(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers?.gatewaytoken as string;

  if (!token) {
    return next(new UnAuthorizedError('Token is not valid from api gateway', 'verifyReviewGatewayRequest() method'));
  }

  try {
    const payload: { id: string; iat: number } = JWT.verify(token, config.GATEWAY_JWT_TOKEN) as { id: string; iat: number };

    if (payload.id !== config.REVIEW) {
      return next(new UnAuthorizedError('Request is not for review service', 'verifyReviewGatewayRequest() method'));
    }
  } catch (error) {
    return next(new UnAuthorizedError('Request payload is invalid', 'verifyReviewGatewayRequest() method'));
  }

  next();
}
