export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  expiresIn: number;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}
