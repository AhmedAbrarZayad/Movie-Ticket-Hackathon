import { apiClient } from '../../../lib/api/client'
import type { AuthSessionResponse, CurrentUserResponse, RegisterInput } from '../types'

export async function register(input: RegisterInput) {
  const { data } = await apiClient.post<AuthSessionResponse>('/auth/register', input)
  return data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<CurrentUserResponse>('/auth/me')
  return data.user
}

