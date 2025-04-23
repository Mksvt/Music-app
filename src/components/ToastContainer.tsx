import React from 'react';
import { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div data-testid="toast-container" className="fixed top-4 right-4 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          data-testid={`toast-${toast.type}`}
          key={toast.id}
          className={`p-4 rounded shadow-md text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;