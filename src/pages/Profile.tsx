import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AvatarPicker } from "../components/AvatarPicker";
import { useAuthStore } from "../features/auth/store/useAuthStore";
import {
  useAvatarsQuery,
  useUpdateUserMutation,
  useUserStatsQuery,
} from "../features/users/hooks/useUserHooks";
import { extractErrorMessages } from "../features/auth/hooks/useAuthHooks";
import { 
  User, 
  Save, 
  Camera, 
  Trophy, 
  Target, 
  Zap, 
  Gamepad2, 
  Mail, 
  Lock, 
  Calendar,
  Sparkles
} from "lucide-react";
import { API_URL } from "../config/env";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "El nombre completo debe tener al menos 2 caracteres"),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  age: z.number().min(1, "La edad debe ser mayor a 0").or(z.nan()).optional().nullable(),
  currentPassword: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.password && data.password.length > 0 && (!data.currentPassword || data.currentPassword.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Debes proporcionar tu contraseña actual para cambiarla",
    path: ["currentPassword"],
  }
).refine(
  (data) => {
    if (data.password && data.password.length > 0 && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Las contraseñas nuevas no coinciden",
    path: ["confirmPassword"],
  }
);

type ProfileFormData = z.infer<typeof profileSchema>;

export const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const { data: avatarsData, isLoading: isAvatarsLoading } = useAvatarsQuery();
  const { data: stats, isLoading: isStatsLoading } = useUserStatsQuery(user?.id || "");
  const updateMutation = useUpdateUserMutation();

  const [selectedAvatarId, setSelectedAvatarId] = useState<string | undefined>(
    user?.avatar?.id,
  );
  const [showAvatarSuccess, setShowAvatarSuccess] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const avatars = avatarsData?.data || [];

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
      age: user?.age ?? null,
      currentPassword: "",
      password: "",
      confirmPassword: "",
    }
  });

  const handleAvatarSave = async () => {
    if (!selectedAvatarId || selectedAvatarId === user?.avatar?.id) return;

    updateMutation.mutate(
      { avatarId: selectedAvatarId },
      {
        onSuccess: () => {
          setShowAvatarSuccess(true);
          setTimeout(() => setShowAvatarSuccess(false), 3000);
        },
        onError: (err) => {
          alert(extractErrorMessages(err));
        },
      },
    );
  };

  const handleAvatarSelect = (avatar: {
    id: string;
    name: string;
    imageUrl: string;
  }) => {
    setSelectedAvatarId(avatar.id);
  };

  const onSubmitProfile = (data: ProfileFormData) => {
    setProfileError(null);
    setShowProfileSuccess(false);

    const ageValue = (data.age === null || data.age === undefined || isNaN(data.age)) ? null : data.age;

    const payload: any = {
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      age: ageValue,
    };

    if (data.password && data.password.length > 0) {
      payload.password = data.password;
      payload.currentPassword = data.currentPassword;
    }

    updateMutation.mutate(payload, {
      onSuccess: (updatedUser) => {
        setShowProfileSuccess(true);
        reset({
          fullName: updatedUser.fullName || "",
          username: updatedUser.username || "",
          email: updatedUser.email || "",
          age: updatedUser.age ?? null,
          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);
        setTimeout(() => setShowProfileSuccess(false), 3000);
      },
      onError: (err) => {
        setProfileError(extractErrorMessages(err));
      }
    });
  };

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-main tracking-tight mb-3">
            Tu Perfil
          </h1>
          <p className="text-text-muted text-lg font-medium">
            Personaliza tu identidad y revisa tu rendimiento de juego
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Columna Izquierda: Tarjeta Perfil + Estadísticas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tarjeta Perfil Básico */}
            <Card className="overflow-hidden shadow-xl shadow-primary/10 border-2 border-primary/20">
              <div className="relative h-32 bg-linear-to-br from-primary via-primary-hover to-purple-600">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzIiBoZWlnaHQ9IjMiPgo8cmVjdCB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjZmZmIj9mIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4wNSI+PC9yZWN0Pgo8L3N2Zz4=')] opacity-30" />
                <div className="absolute -bottom-12 left-6">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-surface border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center bg-linear-to-br from-primary-light to-primary">
                      {user?.avatar?.imageUrl ? (
                        <img
                          src={`${API_URL}/public${user.avatar.imageUrl}`}
                          alt={user.avatar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-14 h-14 text-white/70" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-6 px-6">
                <h2 className="font-extrabold text-2xl text-text-main truncate">
                  {user?.fullName || user?.username || "Usuario"}
                </h2>
                <p className="text-text-muted font-medium mt-1">
                  @{user?.username}
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary-light/50 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-medium text-text-main truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  {user?.age && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-primary-light/50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Edad
                        </p>
                        <p className="text-sm font-medium text-text-main truncate">
                          {user.age} años
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Tarjeta de Estadísticas de Jugador */}
            <Card className="p-6 border-2 border-border shadow-lg">
              <h3 className="font-extrabold text-xl text-text-main mb-4 flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Estadísticas de Juego
              </h3>
              
              {isStatsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Partidas Jugadas */}
                  <div className="p-4 bg-background border border-border rounded-2xl flex flex-col gap-1.5 shadow-sm hover:scale-[1.02] transition-transform duration-200">
                    <Gamepad2 className="w-6 h-6 text-blue-500" />
                    <span className="text-2xl font-black text-text-main">
                      {stats?.totalGames || 0}
                    </span>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider leading-none">
                      Partidas
                    </span>
                  </div>

                  {/* Precisión */}
                  <div className="p-4 bg-background border border-border rounded-2xl flex flex-col gap-1.5 shadow-sm hover:scale-[1.02] transition-transform duration-200">
                    <Target className="w-6 h-6 text-emerald-500" />
                    <span className="text-2xl font-black text-text-main">
                      {stats?.accuracy || 0}%
                    </span>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider leading-none">
                      Precisión
                    </span>
                  </div>

                  {/* Récord */}
                  <div className="p-4 bg-background border border-border rounded-2xl flex flex-col gap-1.5 shadow-sm hover:scale-[1.02] transition-transform duration-200">
                    <Zap className="w-6 h-6 text-amber-500" />
                    <span className="text-2xl font-black text-text-main truncate">
                      {stats?.maxScore || 0}
                    </span>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider leading-none">
                      Récord
                    </span>
                  </div>

                  {/* Podios */}
                  <div className="p-4 bg-background border border-border rounded-2xl flex flex-col gap-1.5 shadow-sm hover:scale-[1.02] transition-transform duration-200">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    <span className="text-2xl font-black text-text-main">
                      {stats?.podiums || 0}
                    </span>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider leading-none">
                      Podios
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Columna Derecha: Avatar + Edición Datos Perfil */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Selector de Avatar */}
            <div className="bg-surface rounded-3xl border-2 border-border p-6 md:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-text-main">
                    Selecciona tu Avatar
                  </h3>
                  <p className="text-sm text-text-muted font-medium">
                    Elige cómo te representarán los demás
                  </p>
                </div>
              </div>

              <AvatarPicker
                avatars={avatars}
                selectedId={selectedAvatarId}
                onSelect={handleAvatarSelect}
                isLoading={isAvatarsLoading}
              />

              {selectedAvatarId && selectedAvatarId !== user?.avatar?.id && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleAvatarSave}
                    isLoading={updateMutation.isPending}
                    icon={Save}
                    className="shadow-lg shadow-primary/30"
                  >
                    Guardar Avatar
                  </Button>
                </div>
              )}

              {showAvatarSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in slide-in-from-bottom-4">
                  <p className="text-green-700 font-bold text-center">
                    ¡Avatar actualizado con éxito!
                  </p>
                </div>
              )}
            </div>

            {/* Formulario de Edición Perfil y Contraseña */}
            <div className="bg-surface rounded-3xl border-2 border-border p-6 md:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-text-main">
                    Datos de la Cuenta
                  </h3>
                  <p className="text-sm text-text-muted font-medium">
                    Actualiza tu información personal o tu contraseña
                  </p>
                </div>
              </div>

              {profileError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl text-center">
                  {profileError}
                </div>
              )}

              {showProfileSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-2xl text-center animate-in zoom-in">
                  ¡Perfil actualizado con éxito!
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre Completo"
                    placeholder="Escribe tu nombre..."
                    error={errors.fullName?.message}
                    {...register("fullName")}
                  />
                  <Input
                    label="Usuario"
                    placeholder="Escribe tu usuario..."
                    error={errors.username?.message}
                    {...register("username")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Correo Electrónico"
                    placeholder="correo@ejemplo.com"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <Input
                    label="Edad (Opcional)"
                    placeholder="Ingresa tu edad..."
                    type="number"
                    error={errors.age?.message}
                    {...register("age", { valueAsNumber: true })}
                  />
                </div>

                {/* Sección de Cambio de Contraseña */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="text-primary font-bold hover:text-primary-hover flex items-center gap-1.5 transition-colors text-sm cursor-pointer focus:outline-none"
                  >
                    <Lock size={16} />
                    {showPasswordSection ? "Ocultar cambio de contraseña" : "¿Quieres cambiar tu contraseña?"}
                  </button>

                  {showPasswordSection && (
                    <div className="mt-4 p-4 border border-dashed border-border rounded-2xl space-y-4 bg-background/30 animate-in slide-in-from-top-2 duration-300">
                      <Input
                        label="Contraseña Actual"
                        placeholder="••••••••"
                        type="password"
                        error={errors.currentPassword?.message}
                        {...register("currentPassword")}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nueva Contraseña"
                          placeholder="••••••••"
                          type="password"
                          error={errors.password?.message}
                          {...register("password")}
                        />
                        <Input
                          label="Confirmar Nueva Contraseña"
                          placeholder="••••••••"
                          type="password"
                          error={errors.confirmPassword?.message}
                          {...register("confirmPassword")}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={updateMutation.isPending}
                    icon={Save}
                    className="shadow-lg shadow-primary/30"
                  >
                    Guardar Perfil
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
