export interface User {
  id: number;
  username: string;
  email: string;
  memberSince: Date;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  username: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateUserRequest {
  location?: string;
  avatarUrl?: string;
  bio?: string;
}
