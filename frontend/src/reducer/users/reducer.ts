import React from 'react'
import { UsersActions, UsersError, UsersHydrateAction, UsersLoginAction, UsersLoginSuccessAction, UsersState, Tokens, User, UsersCreateUserAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const usersInitialState: UsersState = ({
    loading: true,
    login: {
        fetching: false,
        error: null,
        isAuthenticated: false,
        tokens: null,
        user: null
    },
    createUser: {
        fetching: false,
        error: null,
        user: null
    }
})

export const usersReducer: React.Reducer<UsersState, UsersActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.state,
                loading: false,
                login: {
                    ...action.state.login,
                    error: null,
                    fetching: false
                },
                createUser: {
                    ...action.state.createUser,
                    error: null,
                    fetching: false
                }
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                login: {
                    ...state.login,
                    error: null,
                    fetching: false
                },
                createUser: {
                    ...state.createUser,
                    error: null,
                    fetching: false
                }
            }
        case 'login':
            return {
                ...state,
                login: {
                    ...state.login,
                    fetching: true
                }
            }
        case 'login-success':
            return {
                ...state,
                login: {
                    ...state.login,
                    fetching: false,
                    error: null,
                    isAuthenticated: true,
                    tokens: action.tokens,
                    user: action.user
                }
            }
        case 'login-failed':
            return {
                ...state,
                login: {
                    ...state.login,
                    fetching: false,
                    error: action.error,
                    isAuthenticated: false,
                    tokens: null,
                    user: null
                }
            }
        case 'create-user':
            return {
                ...state,
                createUser: {
                    ...state.createUser,
                    fetching: true
                }
            }
        case 'create-user-success':
            return {
                ...state,
                createUser: {
                    ...state.createUser,
                    fetching: false,
                    error: null,
                    user: action.user
                }
            }
        case 'create-user-failed':
            return {
                ...state,
                createUser: {
                    ...state.createUser,
                    fetching: false,
                    error: action.error,
                    user: null
                }
            }
        default:
            return state
    }
}

export const usersSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<UsersState, UsersActions>> => {
        const boundLogin = login(websocket)
        const boundCreateUser = createUser(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'login':
                    return boundLogin(state, action, dispatch)
                case 'login-success':
                    return loginSuccessful(state, action, dispatch)
                case 'create-user':
                    return boundCreateUser(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersHydrateAction> = (state, action, dispatch) => {
    try {
        const rawState = localStorage.getItem('auth-reducer')

        if (!rawState) {
            return dispatch({ type: 'hydrate-failed' })
        }

        const state = JSON.parse(rawState)
        delete state.isAuthenticated

        dispatch({ type: 'hydrate-successful', state: state })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}

const login =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersLoginAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ user: User, tokens: Tokens } | UsersError>('users-login', action.credentials)

                if ('reason' in result) {
                    return dispatch({ type: 'login-failed', error: result.reason })
                }

                dispatch({ type: 'login-success', user: result.user, tokens: result.tokens })
            } catch (error) {
                dispatch({ type: 'login-failed', error: (error as Error).message })
            }
        }


const loginSuccessful: ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersLoginSuccessAction> = async (state, action, dispatch) => {
    localStorage.setItem(
        'auth-reducer',
        JSON.stringify({
            ...state,
            isAuthenticated: true,
            user: action.user,
            tokens: action.tokens
        })
    )
}

const createUser =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersCreateUserAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ user: User, tokens: Tokens } | UsersError>('users-create', action.user)

                if ('reason' in result) {
                    return dispatch({ type: 'create-user-failed', error: result.reason })
                }

                dispatch({ type: 'create-user-success', user: result.user })
            } catch (error) {
                dispatch({ type: 'create-user-failed', error: (error as Error).message })
            }
        }

