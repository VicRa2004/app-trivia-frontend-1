import { useMutation } from '@tanstack/react-query';
import { loginFn, registerFn } from '../api/auth.api';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const extractErrorMessages = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    const msg = error.response.data?.message;
    if (Array.isArray(msg)) {
      return msg.join(', ');
    }
    if (typeof msg === 'string') {
      return msg;
    }
  }
  return 'Ocurrió un error en el servidor. Intenta de nuevo.';
};

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      if (data.access_token) {
        setAuth(data.access_token, data.user);
        navigate('/dashboard', { replace: true });
      }
    },
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerFn,
    onSuccess: () => {
      // Redirigir al login despues de crear la cuenta (O podrias auto-loguear pero el docs no envia access_token).
      alert('¡Cuenta creada con éxito! Por favor, inicia sesión.');
      navigate('/login');
    },
  });
};
