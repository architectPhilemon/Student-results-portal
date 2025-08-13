import { Course, PaginatedResponse, ApiResponse } from '../types';
import { apiService } from './api';

class CourseService {
  async getCourses(params?: {
    page?: number;
    limit?: number;
    department?: string;
    semester?: string;
    year?: number;
    search?: string;
  }): Promise<PaginatedResponse<Course>> {
    return await apiService.get<PaginatedResponse<Course>>('/courses', params);
  }

  async getCourse(id: string): Promise<Course> {
    const response = await apiService.get<{ success: boolean; data: Course }>(`/courses/${id}`);
    return response.data;
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const response = await apiService.post<{ success: boolean; data: Course }>('/courses', courseData);
    return response.data;
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    const response = await apiService.put<{ success: boolean; data: Course }>(`/courses/${id}`, courseData);
    return response.data;
  }

  async deleteCourse(id: string): Promise<void> {
    await apiService.delete(`/courses/${id}`);
  }

  async enrollInCourse(courseId: string): Promise<void> {
    await apiService.post(`/courses/${courseId}/enroll`);
  }

  async dropCourse(courseId: string): Promise<void> {
    await apiService.post(`/courses/${courseId}/drop`);
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const response = await apiService.get<{ success: boolean; data: Course[] }>('/courses/enrolled');
    return response.data;
  }

  async getCourseStudents(courseId: string): Promise<any[]> {
    const response = await apiService.get<{ success: boolean; data: any[] }>(`/courses/${courseId}/students`);
    return response.data;
  }

  async getInstructorCourses(): Promise<Course[]> {
    const response = await apiService.get<{ success: boolean; data: Course[] }>('/courses/instructor');
    return response.data;
  }

  async updateCourseSchedule(courseId: string, schedule: any): Promise<Course> {
    const response = await apiService.put<{ success: boolean; data: Course }>(`/courses/${courseId}/schedule`, { schedule });
    return response.data;
  }

  async uploadCourseMaterial(courseId: string, file: File): Promise<void> {
    await apiService.uploadFile(`/courses/${courseId}/materials`, file);
  }

  async downloadCourseMaterial(courseId: string, materialId: string, filename: string): Promise<void> {
    await apiService.downloadFile(`/courses/${courseId}/materials/${materialId}`, filename);
  }
}

export const courseService = new CourseService();