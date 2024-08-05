import { config } from '@gateway/config';
import axios, { AxiosInstance } from 'axios';
import { sign } from 'jsonwebtoken';

export class AxiosService {
  // public kkt: ReturnType<typeof axios.create>;
  public kkt: AxiosInstance;

  constructor(baseURL: string, serviceName?: string) {
    this.kkt = this.axiosCreateInstance(baseURL, serviceName);
  }
  public axiosCreateInstance(baseURL: string, serviceName?: string): AxiosInstance {
    const requestGatewayToken = serviceName ? sign({ id: serviceName }, `${config.GATEWAY_JWT_TOKEN}`) : '';

    const instance: ReturnType<typeof axios.create> = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewaytoken: requestGatewayToken
      },
      withCredentials: true
    });
    // instance.interceptors.request.use(
    //   (config) => {
    //     console.log('Request config:', config);
    //     return config;
    //   },
    //   (error) => {
    //     console.error('Request error:', error);
    //     return Promise.reject(error);
    //   }
    // );

    // instance.interceptors.response.use(
    //   (response) => {
    //     console.log('Response data:', response.data);
    //     return response;
    //   },
    //   (error: AxiosError) => {
    //     console.error('Axios request error:', error);

    //     if (error.response) {
    //       console.error('Response error data:', error.response.data);
    //       console.error('Response status:', error.response.status);
    //       console.error('Response headers:', error.response.headers);
    //     } else if (error.request) {
    //       console.error('No response received:', error.request);
    //     } else {
    //       console.error('Error setting up request:', error.message);
    //     }

    //     // Handle RedirectableRequest errors
    //     if (error.message.includes('RedirectableRequest')) {
    //       console.error('Redirect error:', error.message);
    //     }

    //     return Promise.reject(error);
    //   }
    // );

    return instance;
  }
}
