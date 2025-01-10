import React from 'react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from './toast';

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'success' | 'error' | 'info';
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, type }) => (
        <Toast
          key={id}
          className={`${
            type === 'error'
              ? 'destructive border-destructive bg-destructive text-destructive-foreground'
              : type === 'success'
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-blue-500 bg-blue-500 text-white'
          }`}
        >
          <div className="grid gap-1">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose onClick={() => onRemove(id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}; 