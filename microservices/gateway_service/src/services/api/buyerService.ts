import { AxiosInstance as buyerInstance, AxiosResponse } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { config } from '@gateway/config';

export let axiosBuyerInstance: buyerInstance;

class BuyerService {
  constructor() {
    const axiosService: AxiosService = new AxiosService(`${config.USER_BASE_URL}/api/v1/buyer`, 'buyer');
    axiosBuyerInstance = axiosService.kkt;
  }

  async email(): Promise<AxiosResponse> {
    console.log('email function called');
    return await axiosBuyerInstance.get('/email');
  }

  async currentUser(): Promise<AxiosResponse> {
    return await axiosBuyerInstance.get('/username');
  }

  async username(username: string): Promise<AxiosResponse> {
    return await axiosBuyerInstance.get(`/${username}`);
  }
}

export const buyerService = new BuyerService();
