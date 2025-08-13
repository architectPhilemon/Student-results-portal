import { Grade, PaginatedResponse } from '../types';
import { apiService } from './api';

class GradeService {
  async getGrades(params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    studentId?: string;
    assignmentId?: string;
  }): Promise<PaginatedResponse<Grade>> {
    return await apiService.get<PaginatedResponse<Grade>>('/grades', params);
  }

  async getGrade(id: string): Promise<Grade> {
    const response = await apiService.get<{ success: boolean; data: Grade }>(`/grades/${id}`);
    return response.data;
  }

  async getStudentGrades(studentId?: string): Promise<Grade[]> {
    const url = studentId ? `/grades/student/${studentId}` : '/grades/student';
    const response = await apiService.get<{ success: boolean; data: Grade[] }>(url);
    return response.data;
  }

  async getCourseGrades(courseId: string): Promise<Grade[]> {
    const response = await apiService.get<{ success: boolean; data: Grade[] }>(`/grades/course/${courseId}`);
    return response.data;
  }

  async getAssignmentGrades(assignmentId: string): Promise<Grade[]> {
    const response = await apiService.get<{ success: boolean; data: Grade[] }>(`/grades/assignment/${assignmentId}`);
    return response.data;
  }

  async updateGrade(id: string, gradeData: {
    points?: number;
    feedback?: string;
    rubricScores?: Array<{
      criteria: string;
      points: number;
      maxPoints: number;
      feedback?: string;
    }>;
  }): Promise<Grade> {
    const response = await apiService.put<{ success: boolean; data: Grade }>(`/grades/${id}`, gradeData);
    return response.data;
  }

  async addGradeComment(gradeId: string, comment: string, isPrivate: boolean = false): Promise<Grade> {
    const response = await apiService.post<{ success: boolean; data: Grade }>(`/grades/${gradeId}/comments`, {
      content: comment,
      isPrivate,
    });
    return response.data;
  }

  async flagGrade(gradeId: string, flagData: {
    type: 'regrade_request' | 'academic_integrity' | 'incomplete' | 'extra_credit';
    description: string;
  }): Promise<Grade> {
    const response = await apiService.post<{ success: boolean; data: Grade }>(`/grades/${gradeId}/flag`, flagData);
    return response.data;
  }

  async resolveFlag(gradeId: string, flagId: string): Promise<Grade> {
    const response = await apiService.post<{ success: boolean; data: Grade }>(`/grades/${gradeId}/flags/${flagId}/resolve`);
    return response.data;
  }

  async getGradeStatistics(courseId?: string): Promise<{
    average: number;
    median: number;
    highest: number;
    lowest: number;
    distribution: Record<string, number>;
    totalGrades: number;
    passingRate: number;
  }> {
    const url = courseId ? `/grades/statistics?courseId=${courseId}` : '/grades/statistics';
    const response = await apiService.get<{ success: boolean; data: any }>(url);
    return response.data;
  }

  async exportGrades(courseId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<void> {
    await apiService.downloadFile(`/grades/export/${courseId}?format=${format}`, `grades.${format}`);
  }

  async calculateGPA(studentId?: string): Promise<{
    currentGPA: number;
    cumulativeGPA: number;
    totalCredits: number;
    gradeDistribution: Record<string, number>;
  }> {
    const url = studentId ? `/grades/gpa/${studentId}` : '/grades/gpa';
    const response = await apiService.get<{ success: boolean; data: any }>(url);
    return response.data;
  }
}

export const gradeService = new GradeService();