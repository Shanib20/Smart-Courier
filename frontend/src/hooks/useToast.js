import { useContext } from 'react';
import { ToastContext } from '../context/ToastContextValue';

export const useToast = () => useContext(ToastContext);
