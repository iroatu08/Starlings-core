export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  preferences?: string
  role: 'user' | 'admin'
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  address?: string
  preferences?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}
