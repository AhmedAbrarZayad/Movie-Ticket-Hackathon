import axios from 'axios'

interface ErrorPayload {
  error?: {
    code?: string
    message?: string
    details?: Record<string, string[]>
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = 'REQUEST_FAILED',
    public readonly status?: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError<ErrorPayload>(error)) {
    return new ApiError(
      error.response?.data?.error?.message ?? 'Unable to complete the request.',
      error.response?.data?.error?.code,
      error.response?.status,
      error.response?.data?.error?.details,
    )
  }
  return new ApiError('Unable to complete the request.')
}

