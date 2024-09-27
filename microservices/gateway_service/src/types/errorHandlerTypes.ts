import { AxiosError, InternalAxiosRequestConfig } from 'axios';

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

export interface ErrnoException extends Error {
  errno?: number;
  code?: number;
  path?: string;
  syscall?: string;
  stack?: string;
}
export interface AxiosErrorWithServiceName extends AxiosError {
  serviceName?: string;
}

export interface AxiosConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: {
    serviceName?: string;
  };
}
