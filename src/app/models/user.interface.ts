export interface User {
  _id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  address: string;
  phoneNumber: string;
  shopId: string;
  role: string;
  createdAt?: string;
  savedRoom?: string | null;
}

export interface UserRegistration {
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  shopId: string;
  address: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}
