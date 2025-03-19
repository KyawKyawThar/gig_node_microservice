import { StatusCodes } from 'http-status-codes';
import { IError } from '@gateway/types/errorHandlerTypes';

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract status: string;
  comingFrom: string;

  protected constructor(message: string, comingFrom: string) {
    super(message);
    this.comingFrom = comingFrom;
  }

  serializeError(): IError {
    return {
      statusCode: this.statusCode,
      message: this.message,
      status: this.status,
      comingFrom: this.comingFrom
    };
  }
}

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  status = 'Bad Request Error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;
  status = 'Not Found Error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  status = 'Unauthorized Error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class ServerError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  status = 'Server Error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class RequestTooLarge extends CustomError {
  statusCode = StatusCodes.REQUEST_TOO_LONG;
  status = 'RequestTooLarge Error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}
