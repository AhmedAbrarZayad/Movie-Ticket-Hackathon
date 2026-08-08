import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { AuthProvider, useAuth } from './auth-context'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(), me: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn(),
}))

vi.mock('../../lib/api/client', () => ({ refreshAccessToken: mocks.refresh }))
vi.mock('./api/login', () => ({ login: mocks.login }))
vi.mock('./api/logout', () => ({ logout: mocks.logout }))
vi.mock('./api/refresh-token', () => ({ getCurrentUser: mocks.me, register: mocks.register }))

function Consumer() {
  const auth = useAuth()
  return <div><span>{auth.isInitializing ? 'loading' : auth.user?.name ?? 'anonymous'}</span><button onClick={() => void auth.logout()}>Logout</button></div>
}

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockReset()))

describe('AuthProvider', () => {
  test('restores a cookie-backed session on startup', async () => {
    mocks.refresh.mockResolvedValue('access-token')
    mocks.me.mockResolvedValue({ id: '1', name: 'Ada', email: 'ada@example.com' })
    render(<AuthProvider><Consumer /></AuthProvider>)
    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(await screen.findByText('Ada')).toBeInTheDocument()
    expect(mocks.refresh).toHaveBeenCalledOnce()
    expect(mocks.me).toHaveBeenCalledOnce()
  })

  test('becomes anonymous after refresh failure and logout', async () => {
    mocks.refresh.mockRejectedValue(new Error('expired'))
    mocks.logout.mockResolvedValue(undefined)
    render(<AuthProvider><Consumer /></AuthProvider>)
    expect(await screen.findByText('anonymous')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }))
    await waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce())
    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })
})
