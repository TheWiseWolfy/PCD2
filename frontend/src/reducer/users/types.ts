
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
        data: null | User
    }
    createUser: {
        fetching: boolean
        error: null | string
        data: null | User
    }
}

export type UsersHydrateAction = { type: 'hydrate' }
export type UsersHydrateSuccessfulAction = { type: 'hydrate-successful', data: UsersState }
export type UsersHydrateFailedAction = { type: 'hydrate-failed' }
export type UsersLoginAction = { type: 'login', data: { email: string, password: string } | { auth: string } }
export type UsersLoginResetAction = { type: 'login-reset' }
export type UsersLoginSuccessAction = { type: 'login-success', data: User, tokens: Tokens }
export type UsersLoginFailedAction = { type: 'login-failed', data: string }
export type UsersCreateUserAction = { type: 'create-user', data: { name: string, email: string, password: string } }
export type UsersCreateUserResetAction = { type: 'create-user-reset' }
export type UsersCreateUserSuccessAction = { type: 'create-user-success', data: User }
export type UsersCreateUserFailedAction = { type: 'create-user-failed', data: string }
export type UsersActions =
| UsersHydrateAction
| UsersHydrateSuccessfulAction
| UsersHydrateFailedAction
| UsersLoginAction
| UsersLoginResetAction
| UsersLoginSuccessAction
| UsersLoginFailedAction
| UsersCreateUserAction
| UsersCreateUserResetAction
| UsersCreateUserSuccessAction
| UsersCreateUserFailedAction