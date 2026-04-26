import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { AvatarPicker } from "../components/AvatarPicker";
import { useAuthStore } from "../features/auth/store/useAuthStore";
import {
  useAvatarsQuery,
  useUpdateUserMutation,
} from "../features/users/hooks/useUserHooks";
import { extractErrorMessages } from "../features/auth/hooks/useAuthHooks";
import { User, Save, Camera } from "lucide-react";
import { API_URL } from "../config/env";

export const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const { data: avatarsData, isLoading: isAvatarsLoading } = useAvatarsQuery();
  const updateMutation = useUpdateUserMutation();

  const [selectedAvatarId, setSelectedAvatarId] = useState<string | undefined>(
    user?.avatar?.id,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const avatars = avatarsData?.data || [];

  const handleSave = async () => {
    if (!selectedAvatarId || selectedAvatarId === user?.avatar?.id) return;

    updateMutation.mutate(
      { avatarId: selectedAvatarId },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
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

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-main tracking-tight mb-3">
            Tu Perfil
          </h1>
          <p className="text-text-muted text-lg font-medium">
            Personaliza tu identidad para las partidas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                    <div className="w-10 h-10 rounded-xl bg-primary-light/50 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
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
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-surface rounded-3xl border-2 border-border p-6 md:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
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
                    onClick={handleSave}
                    isLoading={updateMutation.isPending}
                    icon={Save}
                    className="shadow-lg shadow-primary/30"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              )}

              {showSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in slide-in-from-bottom-4">
                  <p className="text-green-700 font-bold text-center">
                    ¡Avatar actualizado con éxito!
                  </p>
                </div>
              )}
            </div>

            <Card className="p-6 md:p-8 border-dashed border-2 border-border bg-transparent">
              <div className="text-center text-text-muted">
                <p className="font-medium">¿Quieres cambiar tu nombre?</p>
                <p className="text-sm mt-1">
                  Próximamente podrás editar tu perfil completo
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
