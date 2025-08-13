import { User, LoginData, RegisterData, ApiResponse } from '../types';
import { apiService } from './api';

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginData): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/login', credentials);
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/register', userData);
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ success: boolean; user: User }>('/auth/me');
    return response.user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<{ success: boolean; user: User }>('/auth/profile', userData);
    return response.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, newPassword });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<void> {
    await apiService.post('/auth/resend-verification');
  }
}

export const authService = new AuthService();