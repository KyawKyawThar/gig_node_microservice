import { config } from '@gateway/config';
import { AxiosService } from '@gateway/services/axios';
import { IMessageDocuments } from '@gateway/types/chatInterface';
import { AxiosInstance as chatInstance, AxiosResponse } from 'axios';

export let axiosChatInstance: chatInstance;

class ChatService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${config.MESSAGE_BASE_URL}/api/v1/message`, 'chat');
    axiosChatInstance = this.axiosService.kkt;
  }

  async getConversation(senderUsername: string, receiverUsername: string): Promise<AxiosResponse> {
    return await axiosChatInstance.get(`/conversation/${senderUsername}/${receiverUsername}`);
  }
  async getMessages(senderUsername: string, receiverUsername: string): Promise<AxiosResponse> {
    return await axiosChatInstance.get(`/${senderUsername}/${receiverUsername}`);
  }
  async getConversationList(username: string): Promise<AxiosResponse> {
    return await axiosChatInstance.get(`/conversations/${username}`);
  }

  async getUserMessages(conversationId: string): Promise<AxiosResponse> {
    return await axiosChatInstance.get(`/${conversationId}`);
  }

  async createMessage(body: IMessageDocuments): Promise<AxiosResponse> {
    return await axiosChatInstance.post('/', body);
  }

  async updateOffer(body: { messageId: string; type: string }): Promise<AxiosResponse> {
    return await axiosChatInstance.put(`/offer/${body}`);
  }

  async markSingleMessage(messageId: string): Promise<AxiosResponse> {
    return await axiosChatInstance.put(`/mark-as-read/${messageId}`);
  }

  async markMultipleMessages(messageId: string, senderUsername: string, receiverUsername: string): Promise<AxiosResponse> {
    return await axiosChatInstance.put('/mark-multiple-as-read', { messageId, senderUsername, receiverUsername });
  }
}
export const chatService = new ChatService();
