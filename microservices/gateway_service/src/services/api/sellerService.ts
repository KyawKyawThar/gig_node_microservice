import { AxiosInstance as sellerInstance, AxiosResponse } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { config } from '@gateway/config';
import { IBuyerDocument, ISellerDocument } from '@gateway/types/sellerTypes';

export let axiosSellerInstance: sellerInstance;

class SellerService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${config.USER_BASE_URL}/api/v1/seller`, 'seller');
    axiosSellerInstance = this.axiosService.kkt;
  }

  async getSellerById(sellerID: string): Promise<AxiosResponse> {
    return await axiosSellerInstance.get(`/id/${sellerID}`);
  }

  async getSellerByUsername(username: string): Promise<AxiosResponse> {
    return await axiosSellerInstance.get(`/username/${username}`);
  }

  async getRandomSellers(size: string): Promise<AxiosResponse> {
    return await axiosSellerInstance.get(`/random/${size}`);
  }

  async createSeller(body: IBuyerDocument): Promise<AxiosResponse> {
    return await axiosSellerInstance.post('/create', body);
  }

  async updateSeller(sellerId: string, body: ISellerDocument): Promise<AxiosResponse> {
    return await axiosSellerInstance.put(`/seller/${sellerId}`, body);
  }

  async seed(count: string): Promise<AxiosResponse> {
    return await axiosSellerInstance.post(`/seed/${count}`);
  }
}
export const sellerService = new SellerService();
