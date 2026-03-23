import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Lock, Mail, Signature, Gamepad2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../features/auth/schemas';
import { useRegisterMutation, extractErrorMessages } from '../features/auth/hooks/useAuthHooks';
import { Link } from 'react-router-dom';

const Register = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: doRegister, isPending } = useRegisterMutation();

  const onSubmit = (data: RegisterFormData) => {
    setGlobalError(null);
    doRegister(data, {
      onError: (err) => {
        setGlobalError(extractErrorMessages(err));
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-6 mb-12 animate-in fade-in zoom-in duration-300">
        
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-secondary/40">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>

        <Card className="w-full border shadow-xl shadow-secondary/10 sm:p-4">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold text-secondary">Crea tu cuenta</CardTitle>
            <CardDescription className="text-base mt-2">
              Ingresa tus datos para comenzar a crear tus propios Quizzes y retar a tus amigos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {globalError && (
              <div className="mb-6 p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm font-semibold text-center">
                {globalError}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input 
                icon={Signature} 
                label="Nombre Completo" 
                placeholder="Juan Pérez"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input 
                icon={User} 
                label="Usuario" 
                placeholder="juanp"
                error={errors.username?.message}
                {...register('username')}
              />
              <Input 
                icon={Mail} 
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
              <Button type="submit" fullWidth className="text-lg mt-4 shadow-secondary/50 shadow-lg" variant="secondary" isLoading={isPending}>
                Registrarse
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-text-muted">
              ¿Ya tienes una cuenta? <Link to="/login" className="font-bold text-secondary hover:text-secondary-hover">Inicia Sesión</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
