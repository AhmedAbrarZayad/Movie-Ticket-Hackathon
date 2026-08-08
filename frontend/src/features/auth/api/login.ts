import { apiClient } from '../../../lib/api/client'
import type { AuthSessionResponse, LoginInput } from '../types'

export async function login(input: LoginInput) {
  const { data } = await apiClient.post<AuthSessionResponse>('/auth/login', input)
  return data
}

