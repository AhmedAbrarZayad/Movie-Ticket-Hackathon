import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../features/auth/auth-context'
import { appRouter } from './router'

export function AppProviders() {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  )
}
