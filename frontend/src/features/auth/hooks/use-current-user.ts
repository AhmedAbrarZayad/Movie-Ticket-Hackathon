import { useAuth } from '../auth-context'

export function useCurrentUser() {
  const { user, isAuthenticated, isInitializing } = useAuth()
  return { user, isAuthenticated, isInitializing }
}

