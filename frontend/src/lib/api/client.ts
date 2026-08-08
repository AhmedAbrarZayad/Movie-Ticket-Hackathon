import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken } from '../../stores/auth-store'
import type { AuthSessionResponse } from '../../features/auth/types'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const apiClient = axios.create({ baseURL, withCredentials: true })
export const refreshClient = axios.create({ baseURL, withCredentials: true })

interface RetryableRequest extends InternalAxiosRequestConfig {
  _authRetry?: boolean
}

let refreshPromise: Promise<string> | null = null

export async function refreshAccessToken() {
  refreshPromise ??= refreshClient
    .post<AuthSessionResponse>('/auth/refresh')
    .then(({ data }) => {
      setAccessToken(data.accessToken)
      return data.accessToken
    })
    .catch((error) => {
      setAccessToken(null)
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as RetryableRequest | undefined
  const isSessionEndpoint = request?.url?.match(/\/auth\/(login|register|refresh|logout)$/)
  if (error.response?.status !== 401 || !request || request._authRetry || isSessionEndpoint) {
    return Promise.reject(error)
  }

  request._authRetry = true
  const token = await refreshAccessToken()
  request.headers.Authorization = `Bearer ${token}`
  return apiClient(request)
})

