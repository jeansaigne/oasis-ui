import api from '@/plugins/axios'

export interface User {
  id: string
  username: string
  email: string
  emailVerified: boolean
  createdAt: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  identifier: string
  password: string
}

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<User>('/api/auth/register', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<User>('/api/auth/login', payload).then((r) => r.data),

  logout: () => api.post('/api/auth/logout').then(() => undefined),

  me: () => api.get<User>('/api/auth/me').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/api/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    api
      .post<{ message: string }>('/api/auth/reset-password', { token, newPassword })
      .then((r) => r.data),
}

