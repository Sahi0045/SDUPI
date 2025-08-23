/**
 * 🚀 SDUPI Toast Container
 * Manages multiple toast notifications
 */

"use client"

import React from 'react';
import { Toast } from './toast';
import { useToast } from '@/hooks/use-toast';

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
