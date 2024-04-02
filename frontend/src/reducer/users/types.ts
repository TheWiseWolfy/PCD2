
export type User = {
    user_id: string
    email: string
    name: string
}

export type Tokens = {
    auth: string
}

export type UsersError = {
    reason: string
}

export type UsersState = {
    loading: boolean
    login: {
        fetching: boolean
        error: null | string
        isAuthenticated: boolean
        tokens: null | Tokens
        user: null | User
    }
    createUser: {
        fetching: boolean
        error: null | string
        user: null | User
    }
}

export type UsersHydrateAction = { type: 'hydrate' }
export type UsersHydrateSuccessfulAction = { type: 'hydrate-successful', state: UsersState }
export type UsersHydrateFailedAction = { type: 'hydrate-failed' }
export type UsersLoginAction = { type: 'login', credentials: { email: string, password: string } | { auth: string } }
export type UsersLoginResetAction = { type: 'login-reset' }
export type UsersLoginSuccessAction = { type: 'login-success', user: User, tokens: Tokens }
export type UsersLoginFailedAction = { type: 'login-failed', error: string }
export type UsersCreateUserAction = { type: 'create-user', user: { name: string, email: string, password: string } }
export type UsersCreateUserResetAction = { type: 'create-user-reset' }
export type UsersCreateUserSuccessAction = { type: 'create-user-success', user: User }
export type UsersCreateUserFailedAction = { type: 'create-user-failed', error: string }
export type UsersActions = UsersHydrateAction | UsersHydrateSuccessfulAction | UsersHydrateFailedAction | UsersLoginAction | UsersLoginResetAction | UsersLoginSuccessAction | UsersLoginFailedAction | UsersCreateUserAction | UsersCreateUserResetAction | UsersCreateUserSuccessAction | UsersCreateUserFailedAction