import { Announcement, PaginatedResponse } from '../types';
import { apiService } from './api';

class AnnouncementService {
  async getAnnouncements(params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    type?: string;
    priority?: string;
    targetAudience?: string;
  }): Promise<PaginatedResponse<Announcement>> {
    return await apiService.get<PaginatedResponse<Announcement>>('/announcements', params);
  }

  async getAnnouncement(id: string): Promise<Announcement> {
    const response = await apiService.get<{ success: boolean; data: Announcement }>(`/announcements/${id}`);
    return response.data;
  }

  async createAnnouncement(announcementData: Partial<Announcement>): Promise<Announcement> {
    const response = await apiService.post<{ success: boolean; data: Announcement }>('/announcements', announcementData);
    return response.data;
  }

  async updateAnnouncement(id: string, announcementData: Partial<Announcement>): Promise<Announcement> {
    const response = await apiService.put<{ success: boolean; data: Announcement }>(`/announcements/${id}`, announcementData);
    return response.data;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await apiService.delete(`/announcements/${id}`);
  }

  async markAsRead(id: string): Promise<void> {
    await apiService.post(`/announcements/${id}/read`);
  }

  async pinAnnouncement(id: string): Promise<Announcement> {
    const response = await apiService.post<{ success: boolean; data: Announcement }>(`/announcements/${id}/pin`);
    return response.data;
  }

  async unpinAnnouncement(id: string): Promise<Announcement> {
    const response = await apiService.post<{ success: boolean; data: Announcement }>(`/announcements/${id}/unpin`);
    return response.data;
  }

  async addComment(id: string, content: string): Promise<Announcement> {
    const response = await apiService.post<{ success: boolean; data: Announcement }>(`/announcements/${id}/comments`, {
      content,
    });
    return response.data;
  }

  async editComment(id: string, commentId: string, content: string): Promise<Announcement> {
    const response = await apiService.put<{ success: boolean; data: Announcement }>(`/announcements/${id}/comments/${commentId}`, {
      content,
    });
    return response.data;
  }

  async deleteComment(id: string, commentId: string): Promise<Announcement> {
    const response = await apiService.delete<{ success: boolean; data: Announcement }>(`/announcements/${id}/comments/${commentId}`);
    return response.data;
  }

  async getRecentAnnouncements(limit: number = 5): Promise<Announcement[]> {
    const response = await apiService.get<{ success: boolean; data: Announcement[] }>(`/announcements/recent?limit=${limit}`);
    return response.data;
  }

  async getUnreadAnnouncements(): Promise<Announcement[]> {
    const response = await apiService.get<{ success: boolean; data: Announcement[] }>('/announcements/unread');
    return response.data;
  }

  async uploadAttachment(id: string, file: File): Promise<void> {
    await apiService.uploadFile(`/announcements/${id}/attachments`, file);
  }

  async downloadAttachment(id: string, attachmentId: string, filename: string): Promise<void> {
    await apiService.downloadFile(`/announcements/${id}/attachments/${attachmentId}`, filename);
  }
}

export const announcementService = new AnnouncementService();