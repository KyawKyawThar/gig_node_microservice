import { config } from '@auth/config';
import { winstonLogger } from '@auth/logger';
import { AuthModel } from '@auth/models/auth.schema';
import { publicDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { IAuthBuyerMessageDetails, IAuthDocument } from '@auth/types/authTypes';
import { sign } from 'jsonwebtoken';
import { omit, toLower } from 'lodash';
import { Model, Op, DatabaseError } from 'sequelize';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth Service ', 'debug');

export function firstLetterUpperCase(input: string): string {
  if (!input) {
    return '';
  }

  return input.charAt(0).toUpperCase() + input.slice(1);
}

export async function createUser(data: IAuthDocument): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = await AuthModel.create(data);
    const buyerMessageDetail: IAuthBuyerMessageDetails = {
      username: result.dataValues.username,
      profilePicture: result.dataValues.profilePicture,
      email: result.dataValues.email,
      country: result.dataValues.country,
      createdAt: result.dataValues.createdAt,
      type: 'auth'
    };
    await publicDirectMessage(
      authChannel,
      'user-buyer-update',
      'user-buyer',
      JSON.stringify(buyerMessageDetail),
      'buyer details sends to buyer service'
    );

    const userData: IAuthDocument = omit(result.dataValues, ['password']);

    return userData;
  } catch (error) {
    if (error instanceof DatabaseError) {
      logger.error('SQL Error Message:', error.original);
      return error;
    }
  }
}
export async function getUserByID(authId: number): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = (await AuthModel.findOne({
      where: { id: authId },
      attributes: {
        exclude: ['password']
      }
    })) as Model;
    return result.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function getUserByEmail(email: string): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = (await AuthModel.findOne({
      where: {
        email: toLower(email)
      }
    })) as Model;
    return result.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function getUserByUsername(username: string): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = (await AuthModel.findOne({
      where: { username: firstLetterUpperCase(username) }
    })) as Model;
    return result.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function getUserByEmailORUsername(username: string, email: string): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = (await AuthModel.findOne({
      where: {
        [Op.or]: [{ username: firstLetterUpperCase(username) }, { email: toLower(email) }]
      }
    })) as Model;
    return result?.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function getUserByEmailVerifyToken(token: string): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = (await AuthModel.findOne({
      where: { emailVerificationToken: token }
    })) as Model;

    return result.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function updateVerifyEmail(
  authId: number,
  emailVerified: number,
  emailVerificationToken?: string
): Promise<DatabaseError | void> {
  try {
    await AuthModel.update(!emailVerificationToken ? { emailVerified } : { emailVerified, emailVerificationToken }, {
      where: { id: authId }
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function getUserByPasswordToken(token: string): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = (await AuthModel.findOne({
      where: {
        [Op.and]: [{ passwordResetExpires: { [Op.gt]: Date.now() } }, { passwordResetToken: token }]
      }
    })) as Model;
    return result.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<DatabaseError | void> {
  try {
    await AuthModel.update(
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      },
      { where: { id: authId } }
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function updatePassword(authId: number, password: string): Promise<DatabaseError | void> {
  try {
    await AuthModel.update(
      {
        password,
        passwordResetToken: '',
        passwordResetExpires: Date.now()
      },
      { where: { id: authId } }
    );
  } catch (error) {
    logger.info(error);
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export async function getUserByOTP(otp: string): Promise<IAuthDocument | DatabaseError | undefined> {
  try {
    const result = (await AuthModel.findOne({
      where: {
        [Op.and]: [{ otpExpirationDate: { [Op.gt]: new Date() } }, { otp }]
      }
    })) as Model;
    return result.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}
export async function updateUserOTP(
  authId: number,
  otp: string,
  otpExpirationDate: Date,
  browserName: string,
  deviceType: string
): Promise<DatabaseError | void> {
  try {
    await AuthModel.update(
      {
        otp,
        otpExpirationDate,
        ...(browserName.length > 0 && { browserName }),
        ...(deviceType.length > 0 && { deviceType })
      },
      { where: { id: authId } }
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      return error;
    }
  }
}

export function signToken(id: number, username: string, email: string): string {
  return sign({ id, username, email }, config.JWT_SECRET);
}
