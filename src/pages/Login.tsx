import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Lock, Gamepad2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../features/auth/schemas';
import { useLoginMutation, extractErrorMessages } from '../features/auth/hooks/useAuthHooks';
import { Link } from 'react-router-dom';

const Login = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: doLogin, isPending } = useLoginMutation();

  const onSubmit = (data: LoginFormData) => {
    setGlobalError(null);
    doLogin(data, {
      onError: (err) => {
        setGlobalError(extractErrorMessages(err));
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-12 mb-20 animate-in fade-in zoom-in duration-300">
        
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary-light">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>

        <Card className="w-full border shadow-xl shadow-primary-light/20 sm:p-4">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold text-primary">¡Bienvenido!</CardTitle>
            <CardDescription className="text-base mt-2">
              Ingresa tus credenciales para administrar tus trivias o unirte a una partida en curso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {globalError && (
              <div className="mb-6 p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm font-semibold text-center">
                {globalError}
              </div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Input 
                icon={User} 
                label="Correo Electrónico" 
                placeholder="juan@ejemplo.com"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input 
                icon={Lock} 
                label="Contraseña" 
                placeholder="••••••••"
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Button type="submit" fullWidth className="text-lg mt-2 shadow-primary-light/50 shadow-lg" isLoading={isPending}>
                Iniciar Sesión
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-text-muted">
              ¿No tienes una cuenta? <Link to="/register" className="font-bold text-primary hover:text-primary-hover">Regístrate ahora</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
