import { config } from '@gateway/config';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import { sign } from 'jsonwebtoken';
import { AxiosConfigWithMetadata, AxiosErrorWithServiceName } from '@gateway/types/errorHandlerTypes';

export class AxiosService {
  // public kkt: ReturnType<typeof axios.create>;
  public kkt: AxiosInstance;

  constructor(baseURL: string, serviceName?: string) {
    this.kkt = this.axiosCreateInstance(baseURL, serviceName);
  }
  public axiosCreateInstance(baseURL: string, serviceName?: string): AxiosInstance {
    const requestGatewayToken = sign({ id: serviceName }, `${config.GATEWAY_JWT_TOKEN}`);

    const instance: ReturnType<typeof axios.create> = axios.create({
      baseURL,

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewaytoken: requestGatewayToken
      },
      withCredentials: true
    });

    instance.interceptors.request.use(
      (config: AxiosConfigWithMetadata): AxiosConfigWithMetadata => {
        config.metadata = { serviceName: serviceName || 'unknown-service' }; // Attach serviceName to metadata
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => response,
      (error: AxiosErrorWithServiceName) => {
        if (isAxiosError(error)) {
          // Attach the serviceName from the request metadata to the error object
          const customConfig = error.config as AxiosConfigWithMetadata;
          error.serviceName = customConfig.metadata?.serviceName || 'unknown-service';
        }
        return Promise.reject(error);
      }
    );

    // instance.interceptors.response.use(
    //   (response) => {
    //     console.log(`Response from ${serviceName} service received:`, response.data);
    //     return response;
    //   },
    //   (error: AxiosError) => {
    //     console.error('Axios request error:', error);
    //
    //     if (error.response) {
    //       // Handle errors from the response (like 4xx or 5xx status codes)
    //       console.error('Response error data:', error.response.data);
    //       console.error('Response status:', error.response.status);
    //       console.error('Response headers:', error.response.headers);
    //
    //       return Promise.reject({
    //         message: error.response.data || 'Error occurred while communicating with the service.',
    //         statusCode: error.response.status,
    //         comingFrom: serviceName
    //       });
    //     } else if (error.code === 'ECONNREFUSED') {
    //       // Handle service down or unreachable
    //       console.error(`${serviceName} is not reachable or started.`);
    //       return Promise.reject({
    //         message: `${serviceName} is not reachable or started.`,
    //         statusCode: 503,
    //         comingFrom: serviceName
    //       });
    //     } else if (error.request) {
    //       // No response received
    //       console.error(`No response received from ${serviceName}:`, error.request);
    //       return Promise.reject({
    //         message: `No response received from ${serviceName}.`,
    //         statusCode: 502,
    //         comingFrom: serviceName
    //       });
    //     } else {
    //       // Any other errors setting up the request
    //       console.error(`Error setting up request to ${serviceName}:`, error.message);
    //       return Promise.reject({
    //         message: `Error setting up request to ${serviceName}: ${error.message}`,
    //         statusCode: 500,
    //         comingFrom: serviceName
    //       });
    //     }
    //   }
    // );

    return instance;
  }
}
