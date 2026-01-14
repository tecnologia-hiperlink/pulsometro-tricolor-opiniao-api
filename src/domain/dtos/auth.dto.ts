import { IUser } from '../entities';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: Omit<IUser, 'password'>;
}
