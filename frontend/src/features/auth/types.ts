export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface AuthSessionResponse {
  user: AuthUser
  accessToken: string
}

export interface CurrentUserResponse {
  user: AuthUser
}

