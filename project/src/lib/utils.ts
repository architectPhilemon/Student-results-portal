import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy') {
  return format(new Date(date), formatStr);
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date) {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatGPA(gpa: number) {
  return gpa.toFixed(2);
}

export function getGradeColor(grade: number, totalPoints: number) {
  const percentage = (grade / totalPoints) * 100;
  
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  if (percentage >= 60) return 'text-orange-600';
  return 'text-red-600';
}

export function getLetterGrade(percentage: number) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getAssignmentTypeColor(type: string) {
  switch (type) {
    case 'exam':
      return 'bg-red-100 text-red-800';
    case 'quiz':
      return 'bg-orange-100 text-orange-800';
    case 'project':
      return 'bg-purple-100 text-purple-800';
    case 'homework':
      return 'bg-blue-100 text-blue-800';
    case 'lab':
      return 'bg-green-100 text-green-800';
    case 'essay':
      return 'bg-indigo-100 text-indigo-800';
    case 'presentation':
      return 'bg-pink-100 text-pink-800';
    case 'discussion':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner':
    case 'Easy':
      return 'bg-green-100 text-green-800';
    case 'Intermediate':
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Advanced':
    case 'Hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function calculateGPA(grades: Array<{ percentage: number; credits: number }>) {
  if (grades.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  grades.forEach(({ percentage, credits }) => {
    const gradePoints = getGradePoints(getLetterGrade(percentage));
    totalPoints += gradePoints * credits;
    totalCredits += credits;
  });
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function getGradePoints(letterGrade: string) {
  const gradeScale: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeScale[letterGrade] || 0;
}

export function isAssignmentOverdue(dueDate: string) {
  return new Date() > new Date(dueDate);
}

export function getTimeUntilDue(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 0) return 'Overdue';
  if (diffInHours < 24) return `${Math.ceil(diffInHours)} hours`;
  
  const diffInDays = Math.ceil(diffInHours / 24);
  return `${diffInDays} days`;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string) {
  return password.length >= 6 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
}

export function generateInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getRandomColor() {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}