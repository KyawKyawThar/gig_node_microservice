import { config } from '@auth/config';
import { BadRequestError, ServerError } from '@auth/errorHandler';
import { winstonLogger } from '@auth/logger';
import { getUserByEmailVerifyToken, getUserByID, updateVerifyEmail } from '@auth/services/auth.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';
import { DatabaseError } from 'sequelize';
import { IAuthDocument } from '@auth/types/authTypes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

//can also add email verified expiration fields on db
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.body;

    const result = await getUserByEmailVerifyToken(token);

    if (result instanceof DatabaseError) {
      logger.error(`SQL Error Message: ${result.original.message}`);
      throw new ServerError(result.original.message, 'auth-service verifyOTP method() error');
    }
    const checkUserIfExists = result as IAuthDocument;

    if (checkUserIfExists.emailVerified) {
      throw new BadRequestError('email already verified.', 'auth-service verifyEmail method() error');
    }
    if (!checkUserIfExists) {
      throw new BadRequestError('user does not exist', 'auth-service verifyEmail method() error');
    }

    await updateVerifyEmail(checkUserIfExists.id!, 1);

    const updateUser = await getUserByID(checkUserIfExists.id!);
    res.status(StatusCodes.OK).json({ message: 'Email verification successfully', user: updateUser });

    logger.info('Email verification successfully');
  } catch (err) {
    // console.log(err);
    next(err);
  }
}
