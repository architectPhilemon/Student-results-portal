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
    return await apiService.post<AuthResponse>('api/auth/login', credentials);
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('api/auth/register', userData);
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ success: boolean; user: User }>('api/auth/me');
    return response.user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<{ success: boolean; user: User }>('api/auth/profile', userData);
    return response.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.put('api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async logout(): Promise<void> {
    await apiService.post('api/auth/logout');
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('api/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('api/auth/reset-password', { token, newPassword });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post('api/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<void> {
    await apiService.post('api/auth/resend-verification');
  }
}

export const authService = new AuthService();
