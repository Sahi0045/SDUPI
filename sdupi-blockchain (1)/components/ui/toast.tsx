/**
 * 🚀 SDUPI Toast Component
 * Displays notifications and alerts
 */

"use client"

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  onDismiss?: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onDismiss
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  const variantStyles = {
    default: 'bg-background border-border',
    destructive: 'bg-destructive text-destructive-foreground border-destructive',
    success: 'bg-green-500 text-white border-green-600',
    warning: 'bg-yellow-500 text-white border-yellow-600'
  };

  const iconStyles = {
    default: 'text-foreground',
    destructive: 'text-destructive-foreground',
    success: 'text-white',
    warning: 'text-white'
  };

  return (
    <div
      className={cn(
        'flex w-full items-center space-x-4 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out',
        variantStyles[variant]
      )}
    >
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-medium leading-none">{title}</h4>
        {description && (
          <p className="text-sm leading-none opacity-90">{description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss?.(id)}
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          iconStyles[variant]
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
};

export { Toast };
