import { config } from '@auth/config';
import { winstonLogger } from '@auth/logger';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { getUserByUsername, signToken } from '@auth/services/auth.service';
import { BadRequestError, ServerError } from '@auth/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { DatabaseError } from 'sequelize';
import { IAuthDocument } from '@auth/types/authTypes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

//can also add expired time in token
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getUserByUsername(req.params.username);

    if (result instanceof DatabaseError) {
      logger.error(`SQL Error Message: ${result.original.message}`);
      throw new ServerError(result.original.message, 'auth-service verifyOTP method() error');
    }
    const checkExistingUser = result as IAuthDocument;

    if (!checkExistingUser) {
      throw new BadRequestError('user does not exist', 'auth-service currentUser method() error');
    }
    const token = signToken(checkExistingUser.id!, checkExistingUser.username!, checkExistingUser.email!);
    res.status(StatusCodes.OK).json({ message: 'refresh token has been generated successfully', user: token });
    logger.info('Sending refresh token request is successfully');
  } catch (error) {
    next(error);
  }
}
