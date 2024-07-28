import { config } from '@gateway/config';
import axios from 'axios';
import { sign } from 'jsonwebtoken';

export class AxiosService {
  public kkt: ReturnType<typeof axios.create>;

  constructor(baseURL: string, serviceName?: string) {
    this.kkt = this.axiosCreateInstance(baseURL, serviceName);
  }
  public axiosCreateInstance(baseURL: string, serviceName?: string): ReturnType<typeof axios.create> {
    let requestGatewayToken = '';

    if (serviceName) {
      requestGatewayToken = sign({ id: serviceName }, `${config.GATEWAY_JWT_TOKEN}`);
    }

    const instance: ReturnType<typeof axios.create> = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewayToken: requestGatewayToken
      }
    });

    return instance;
  }
}
