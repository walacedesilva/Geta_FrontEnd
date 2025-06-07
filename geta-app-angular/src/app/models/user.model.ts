export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
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
