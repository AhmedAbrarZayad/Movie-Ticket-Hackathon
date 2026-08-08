import { useAuth } from '../auth-context'

export function useLogin() {
  return useAuth().login
}

