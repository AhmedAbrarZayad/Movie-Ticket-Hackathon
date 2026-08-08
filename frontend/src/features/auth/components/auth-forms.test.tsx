import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'

const auth = {
  login: vi.fn(), register: vi.fn(), logout: vi.fn(), user: null,
  accessToken: null, isAuthenticated: false, isInitializing: false,
}

vi.mock('../auth-context', () => ({ useAuth: () => auth }))

function renderForm(form: ReactNode) {
  return render(<MemoryRouter>{form}</MemoryRouter>)
}

beforeEach(() => {
  auth.login.mockReset()
  auth.register.mockReset()
})

describe('LoginForm', () => {
  test('shows client validation and does not submit invalid credentials', async () => {
    const user = userEvent.setup()
    renderForm(<LoginForm />)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
    expect(auth.login).not.toHaveBeenCalled()
  })

  test('submits valid credentials', async () => {
    auth.login.mockResolvedValue({ id: '1', name: 'Ada', email: 'ada@example.com' })
    const user = userEvent.setup()
    renderForm(<LoginForm />)
    await user.type(screen.getByLabelText('Email address'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(auth.login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password123' })
  })
})

describe('SignupForm', () => {
  test('rejects mismatched passwords', async () => {
    const user = userEvent.setup()
    renderForm(<SignupForm />)
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email address'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.type(screen.getByLabelText('Confirm password'), 'password456')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(auth.register).not.toHaveBeenCalled()
  })

  test('registers without sending password confirmation', async () => {
    auth.register.mockResolvedValue({ id: '1', name: 'Ada Lovelace', email: 'ada@example.com' })
    const user = userEvent.setup()
    renderForm(<SignupForm />)
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email address'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.type(screen.getByLabelText('Confirm password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(auth.register).toHaveBeenCalledWith({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123' })
  })
})
