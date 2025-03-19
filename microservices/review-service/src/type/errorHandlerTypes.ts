export interface IError {
  statusCode: number;
  message: string;
  status: string;
  comingFrom: string;
}

export interface IErrorResponse {
  statusCode: number;
  message: string;
  status: string;
  comingFrom: string;
  serializeError(): IError;
}

export interface ErrorException extends Error {
  errno?: number;
  code?: number;
  path?: string;
  syscall?: string;
  stack?: string;
}
