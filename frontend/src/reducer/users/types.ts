
export type User = {
    id: string
    username: string
}

export type Tokens = {
    auth: string
}

export type UsersError = {
    reason: string
}

export type UsersState = {
    loading: boolean
    fetching: boolean
    isAuthenticated: boolean
    error: null | string
    tokens: null | Tokens
    user: null | User
}

export type UsersHydrateAction = { type: 'hydrate' }
export type UsersHydrateSuccessfulAction = { type: 'hydrate-successful', state: UsersState }
export type UsersHydrateFailedAction = { type: 'hydrate-failed' }
export type UsersLoginAction = { type: 'login', credentials: { email: string, password: string } | { auth: string } }
export type UsersLoginSuccessAction = { type: 'login-success', user: User, tokens: Tokens }
export type UsersLoginFailedAction = { type: 'login-failed', error: string }
export type UsersActions = UsersHydrateAction | UsersHydrateSuccessfulAction | UsersHydrateFailedAction | UsersLoginAction | UsersLoginSuccessAction | UsersLoginFailedAction