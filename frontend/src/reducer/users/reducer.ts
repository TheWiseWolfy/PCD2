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
        data: null
    },
    createUser: {
        fetching: false,
        error: null,
        data: null
    }
})

export const usersReducer: React.Reducer<UsersState, UsersActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.data,
                loading: false,
                login: {
                    ...action.data.login,
                    error: null,
                    fetching: false
                },
                createUser: {
                    ...action.data.createUser,
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
                    data: action.data
                }
            }
        case 'login-failed':
            return {
                ...state,
                login: {
                    ...state.login,
                    fetching: false,
                    error: action.data,
                    isAuthenticated: false,
                    tokens: null,
                    data: null
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
                    data: action.data
                }
            }
        case 'create-user-failed':
            return {
                ...state,
                createUser: {
                    ...state.createUser,
                    fetching: false,
                    error: action.data,
                    data: null
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

        dispatch({ type: 'hydrate-successful', data: state })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}

const login =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersLoginAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ user: User, tokens: Tokens } | UsersError>('users-login', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'login-failed', data: result.reason })
                }

                dispatch({ type: 'login-success', data: result.user, tokens: result.tokens })
            } catch (error) {
                dispatch({ type: 'login-failed', data: (error as Error).message })
            }
        }


const loginSuccessful: ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersLoginSuccessAction> = async (state, action, dispatch) => {
    localStorage.setItem(
        'auth-reducer',
        JSON.stringify({
            ...state,
            isAuthenticated: true,
            user: action.data,
            tokens: action.tokens
        })
    )
}

const createUser =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersCreateUserAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ user: User, tokens: Tokens } | UsersError>('users-create', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'create-user-failed', data: result.reason })
                }

                dispatch({ type: 'create-user-success', data: result.user })
            } catch (error) {
                dispatch({ type: 'create-user-failed', data: (error as Error).message })
            }
        }

