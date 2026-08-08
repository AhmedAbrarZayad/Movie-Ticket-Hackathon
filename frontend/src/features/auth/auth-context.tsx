import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { refreshAccessToken } from '../../lib/api/client'
import { setAccessToken, subscribeToAccessToken } from '../../stores/auth-store'
import { login as loginRequest } from './api/login'
import { logout as logoutRequest } from './api/logout'
import { getCurrentUser, register as registerRequest } from './api/refresh-token'
import type { AuthUser, LoginInput, RegisterInput } from './types'

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setTokenState] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => subscribeToAccessToken(setTokenState), [])

  useEffect(() => {
    let active = true
    async function restoreSession() {
      try {
        await refreshAccessToken()
        const currentUser = await getCurrentUser()
        if (active) setUser(currentUser)
      } catch {
        setAccessToken(null)
        if (active) setUser(null)
      } finally {
        if (active) setIsInitializing(false)
      }
    }
    void restoreSession()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const session = await loginRequest(input)
    setAccessToken(session.accessToken)
    setUser(session.user)
    return session.user
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const session = await registerRequest(input)
    setAccessToken(session.accessToken)
    setUser(session.user)
    return session.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, isAuthenticated: Boolean(user && accessToken), isInitializing, login, register, logout }),
    [user, accessToken, isInitializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
