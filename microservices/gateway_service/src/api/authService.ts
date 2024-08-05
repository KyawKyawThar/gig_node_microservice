import { config } from '@gateway/config';
import { AxiosService } from '@gateway/services/axios';
import { IAuth } from '@gateway/types/auth-interface';
import { AxiosResponse, AxiosInstance as authInstance } from 'axios';

export let AxiosAuthInstance: authInstance;
//export let AxiosInstance: ReturnType<typeof axios.create>
class AuthService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${config.AUTH_BASE_URL}/api/v1/auth`, 'auth');
    AxiosAuthInstance = this.axiosService.kkt; //for protected routes because we add bearer token for this one in server.ts
  }

  async signUp(body: IAuth): Promise<AxiosResponse> {
    const response = await this.axiosService.kkt.post('/sign-up', body);
    return response;
  }

  async signIn(body: IAuth): Promise<AxiosResponse> {
    const response = await this.axiosService.kkt.post('/sign-in', body);
    return response;
  }

  async verifyEmail(token: string): Promise<AxiosResponse> {
    const responses: AxiosResponse = await AxiosAuthInstance.put('/verify-email', { token });
    return responses;
  }

  async verifyOTP(otp: string, body: { browserName: string; deviceType: string }): Promise<AxiosResponse> {
    const response: AxiosResponse = await AxiosAuthInstance.put(`/verify-otp/${otp}`, body);
    return response;
  }

  async getCurrentUser(): Promise<AxiosResponse> {
    const response: AxiosResponse = await AxiosAuthInstance.get('/current-user');
    return response;
  }
  async resendEmail(body: { email: string }): Promise<AxiosResponse> {
    const response: AxiosResponse = await AxiosAuthInstance.post('/resend-email', body);
    return response;
  }
  async getRefreshToken(username: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await AxiosAuthInstance.get(`/refresh-token/${username}`);
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await AxiosAuthInstance.put('/change-password', { currentPassword, newPassword });
    return response;
  }

  async forgetPassword(email: string): Promise<AxiosResponse> {
    const response = await this.axiosService.kkt.put('/forget-password', { email });
    return response;
  }

  async resetPassword(token: string, body: { password: string; confirmPassword: string }): Promise<AxiosResponse> {
    const response = await this.axiosService.kkt.post(`/reset-password/${token}`, body);
    return response;
  }
  async seed(count: number): Promise<AxiosResponse> {
    const response = await this.axiosService.kkt.put(`/seed/:${count}`);
    return response;
  }
}

export const authService = new AuthService();
