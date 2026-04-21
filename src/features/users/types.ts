export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  age?: number;
  preferredLanguage?: string;
  createdAt: string;
  avatar?: Avatar;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface UpdateUserData {
  fullName?: string;
  avatarId?: string;
}