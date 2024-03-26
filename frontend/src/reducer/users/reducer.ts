import React from 'react'
import { UsersActions, UsersError, UsersHydrateAction, UsersLoginAction, UsersLoginSuccessAction, UsersState, Tokens, User } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const usersInitialState: UsersState = ({
    loading: true,
    fetching: false,
    isAuthenticated: false,
    error: null,
    tokens: null,
    user: null
})

export const usersReducer: React.Reducer<UsersState, UsersActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.state,
                loading: false,
                fetching: false
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                fetching: false
            }
        case 'login':
            return {
                ...state,
                fetching: true
            }
        case 'login-success':
            return {
                ...state,
                fetching: false,
                isAuthenticated: true,
                error: null,
                tokens: action.tokens,
                user: action.user
            }
        case 'login-failed':
            return {
                ...state,
                fetching: false,
                isAuthenticated: false,
                error: action.error,
                tokens: null,
                user: null
            }
        default:
            return state
    }
}

export const usersSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<UsersState, UsersActions>> => {
        const boundLogin = login(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'login':
                    return boundLogin(state, action, dispatch)
                case 'login-success':
                    return loginSuccessful(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<UsersState, UsersActions>, UsersHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('auth-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-successful', state: JSON.parse(data) })
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
                dispatch({ type: 'login-failed', error: error as string })
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