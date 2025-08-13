import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600',
        sizeClasses[size],
        className
      )}
    />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};