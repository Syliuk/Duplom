import toast from 'react-hot-toast';

type ToastId = string;

export const useToast = () => {
  const success = (message: string) => {
    toast.success(message, {
      icon: '✅',
      duration: 2500,
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      icon: '❌',
      duration: 4000,
    });
  };

  const loading = (message: string): ToastId => {
    const id = toast.loading(message, {
      icon: '⌛',
    });

    return String(id);
  };

  const dismiss = (toastId?: ToastId) => {
    toast.dismiss(toastId);
  };

  return { success, error, loading, dismiss };
};