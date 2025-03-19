import { AxiosResponse, AxiosInstance as orderInstance } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { config } from '@gateway/config';
import { IDeliveredWork, IExtendedDelivery, IOrderDocument, IOrderMessage } from '@gateway/types/orderInterface';

export let axiosOrderInstance: orderInstance;

class OrderService {
  constructor() {
    const axiosService = new AxiosService(`${config.ORDER_BASE_URL}/api/v1/order`, 'order');

    axiosOrderInstance = axiosService.kkt;
  }
  async getOrderById(orderId: string): Promise<AxiosResponse> {
    return await axiosOrderInstance.get(`/${orderId}`);
  }

  async sellerOrder(sellerId: string): Promise<AxiosResponse> {
    return await axiosOrderInstance.get(`/seller/${sellerId}`);
  }

  async buyerOrder(buyerId: string): Promise<AxiosResponse> {
    return await axiosOrderInstance.get(`/buyer/${buyerId}`);
  }

  async createOrderIntent(price: number, orderId: string): Promise<AxiosResponse> {
    return await axiosOrderInstance.post('/create-payment-intent', { price, orderId });
  }

  async createOrder(data: IOrderDocument): Promise<AxiosResponse> {
    return await axiosOrderInstance.post('/', data);
  }
  async cancelOrder(paymentIntentId: string, orderId: string, body: IOrderMessage): Promise<AxiosResponse> {
    return await axiosOrderInstance.put(`/cancel/${orderId}`, { paymentIntentId, orderData: body });
  }

  async requestDeleliveryExtension(orderId: string, body: IExtendedDelivery): Promise<AxiosResponse> {
    return axiosOrderInstance.put(`/extension/${orderId}`, body);
  }
  async updateDeleiveryExtension(type: string, orderId: string, body: IExtendedDelivery): Promise<AxiosResponse> {
    return axiosOrderInstance.put(`/gig/${type}/${orderId}`, body);
  }

  async deliverOrder(orderId: string, body: IDeliveredWork): Promise<AxiosResponse> {
    return await axiosOrderInstance.put(`/deliver-order/${orderId}`, body);
  }

  async approveOrder(orderId: string, body: IOrderMessage): Promise<AxiosResponse> {
    return await axiosOrderInstance.put(`/approve-order/${orderId}`, body);
  }

  async getNotifications(userTo: string): Promise<AxiosResponse> {
    return await axiosOrderInstance.get(`/notification/${userTo}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<AxiosResponse> {
    return await axiosOrderInstance.put('/notification/mark-as-read', { notificationId });
  }
}

export const orderService = new OrderService();
