import { Assignment, Submission, PaginatedResponse } from '../types';
import { apiService } from './api';

class AssignmentService {
  async getAssignments(params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Assignment>> {
    return await apiService.get<PaginatedResponse<Assignment>>('/assignments', params);
  }

  async getAssignment(id: string): Promise<Assignment> {
    const response = await apiService.get<{ success: boolean; data: Assignment }>(`/assignments/${id}`);
    return response.data;
  }

  async createAssignment(assignmentData: Partial<Assignment>): Promise<Assignment> {
    const response = await apiService.post<{ success: boolean; data: Assignment }>('/assignments', assignmentData);
    return response.data;
  }

  async updateAssignment(id: string, assignmentData: Partial<Assignment>): Promise<Assignment> {
    const response = await apiService.put<{ success: boolean; data: Assignment }>(`/assignments/${id}`, assignmentData);
    return response.data;
  }

  async deleteAssignment(id: string): Promise<void> {
    await apiService.delete(`/assignments/${id}`);
  }

  async submitAssignment(assignmentId: string, submissionData: {
    content: string;
    attachments?: File[];
  }): Promise<Submission> {
    const formData = new FormData();
    formData.append('content', submissionData.content);
    
    if (submissionData.attachments) {
      submissionData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await apiService.post<{ success: boolean; data: Submission }>(
      `/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getSubmission(assignmentId: string, studentId?: string): Promise<Submission> {
    const url = studentId 
      ? `/assignments/${assignmentId}/submissions/${studentId}`
      : `/assignments/${assignmentId}/submission`;
    const response = await apiService.get<{ success: boolean; data: Submission }>(url);
    return response.data;
  }

  async getAssignmentSubmissions(assignmentId: string): Promise<Submission[]> {
    const response = await apiService.get<{ success: boolean; data: Submission[] }>(`/assignments/${assignmentId}/submissions`);
    return response.data;
  }

  async gradeSubmission(assignmentId: string, studentId: string, gradeData: {
    grade: number;
    feedback?: string;
    rubricScores?: Array<{
      criteria: string;
      points: number;
      feedback?: string;
    }>;
  }): Promise<void> {
    await apiService.post(`/assignments/${assignmentId}/grade/${studentId}`, gradeData);
  }

  async getUpcomingAssignments(): Promise<Assignment[]> {
    const response = await apiService.get<{ success: boolean; data: Assignment[] }>('/assignments/upcoming');
    return response.data;
  }

  async getOverdueAssignments(): Promise<Assignment[]> {
    const response = await apiService.get<{ success: boolean; data: Assignment[] }>('/assignments/overdue');
    return response.data;
  }

  async publishAssignment(id: string): Promise<Assignment> {
    const response = await apiService.post<{ success: boolean; data: Assignment }>(`/assignments/${id}/publish`);
    return response.data;
  }

  async unpublishAssignment(id: string): Promise<Assignment> {
    const response = await apiService.post<{ success: boolean; data: Assignment }>(`/assignments/${id}/unpublish`);
    return response.data;
  }

  async downloadSubmissionAttachment(assignmentId: string, submissionId: string, attachmentId: string, filename: string): Promise<void> {
    await apiService.downloadFile(`/assignments/${assignmentId}/submissions/${submissionId}/attachments/${attachmentId}`, filename);
  }
}

export const assignmentService = new AssignmentService();