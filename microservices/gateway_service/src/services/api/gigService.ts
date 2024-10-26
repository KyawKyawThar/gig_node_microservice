import { config } from '@gateway/config';
import { AxiosService } from '@gateway/services/axios';
import { ISellerGig } from '@gateway/types/auth-interface';
import { AxiosInstance as gigInstance, AxiosResponse } from 'axios';

export let axiosGigInstance: gigInstance;
class GigService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${config.GIG_BASE_URL}/api/v1/gig`, 'gigs');
    axiosGigInstance = this.axiosService.kkt;
  }

  async getGigById(gigId: string): Promise<AxiosResponse> {
    return await axiosGigInstance.get(`/${gigId}`);
  }

  async sellerByGigId(sellerId: string): Promise<AxiosResponse> {
    return await axiosGigInstance.get(`/seller/${sellerId}`);
  }

  async sellerInactiveGigs(sellerId: string): Promise<AxiosResponse> {
    return await axiosGigInstance.get(`/seller/pause/${sellerId}`);
  }

  async gigByCategory(username: string): Promise<AxiosResponse> {
    return await axiosGigInstance.get(`/category/${username}`);
  }

  async topRelatedGigs(username: string): Promise<AxiosResponse> {
    return await axiosGigInstance.get(`/top/${username}`);
  }

  async similarGigs(gigId: string): Promise<AxiosResponse> {
    return await axiosGigInstance.get(`/similar/${gigId}`);
  }

  async searchGig(from: string, size: string, type: string, query: string): Promise<AxiosResponse> {
    return await axiosGigInstance.get(`/search/${from}/${size}/${type}?query=${query}`);
  }

  async createGig(body: ISellerGig): Promise<AxiosResponse> {
    return await axiosGigInstance.post('/create', body);
  }

  async updateGig(gigId: string, body: ISellerGig): Promise<AxiosResponse> {
    return await axiosGigInstance.put(`/${gigId}`, body);
  }

  async seed(count: string): Promise<AxiosResponse> {
    return await axiosGigInstance.post(`/seed/${count}`);
  }

  async updateActiveGig(gigId: string, active: boolean): Promise<AxiosResponse> {
    return await axiosGigInstance.put(`/active/${gigId}`, { active });
  }

  async deleteGig(gigId: string, sellerId: string): Promise<AxiosResponse> {
    return await axiosGigInstance.delete(`/${gigId}/${sellerId}`);
  }
}
export const gigService = new GigService();
