import React from 'react'
import { TokensActions, TokensError, TokensHydrateAction, TokensState, Token, TokensGetAction, TokensGetAllAction, TokensCreateAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const tokensInitialState: TokensState = ({
    loading: true,
    getTokens: {
        fetching: false,
        error: null,
        data: []
    },
    getToken: {
        fetching: false,
        error: null,
        data: null
    },
    createToken: {
        fetching: false,
        error: null,
        data: null
    }
})

export const tokensReducer: React.Reducer<TokensState, TokensActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.data,
                loading: false,
                getTokens: {
                    ...action.data.getTokens,
                    error: null,
                    fetching: false
                },
                getToken: {
                    ...action.data.getToken,
                    error: null,
                    fetching: false
                }
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                getTokens: {
                    ...state.getTokens,
                    error: null,
                    fetching: false
                },
                getToken: {
                    ...state.getToken,
                    error: null,
                    fetching: false
                }
            }
        case 'get-all-tokens':
            return {
                ...state,
                getTokens: {
                    ...state.getTokens,
                    fetching: true,
                    error: null
                }
            }
        case 'get-all-tokens-success':
            return {
                ...state,
                getTokens: {
                    ...state.getTokens,
                    fetching: false,
                    error: null,
                    data: action.data
                }
            }
        case 'get-all-tokens-failed':
            return {
                ...state,
                getTokens: {
                    ...state.getTokens,
                    fetching: false,
                    error: action.data,
                }
            }
        case 'get-token':
            return {
                ...state,
                getToken: {
                    ...state.getToken,
                    fetching: true,
                    error: null
                }
            }
        case 'get-token-success': {
            const existingTokenIndex = state.getTokens.data.findIndex(item => item.token_id === action.data.token_id)
            return {
                ...state,
                getTokens: {
                    ...state.getTokens,
                    data: existingTokenIndex === -1
                        ? [action.data]
                        : [
                            ...state.getTokens.data.slice(0, existingTokenIndex),
                            action.data,
                            ...state.getTokens.data.slice(existingTokenIndex + 1)
                        ]
                },
                getToken: {
                    ...state.getToken,
                    fetching: false,
                    error: null,
                    data: action.data
                }
            }
        }
        case 'get-token-failed':
            return {
                ...state,
                getToken: {
                    ...state.getToken,
                    fetching: false,
                    error: action.data
                }
            }
        case 'create-token':
            return {
                ...state,
                createToken: {
                    ...state.createToken,
                    fetching: true,
                    error: null
                }
            }
        case 'create-token-success': {
            const existingTokenIndex = state.getTokens.data.findIndex(item => item.token_id === action.data.token_id)
            return {
                ...state,
                getTokens: {
                    ...state.getTokens,
                    data: existingTokenIndex === -1
                        ? [action.data]
                        : [
                            ...state.getTokens.data.slice(0, existingTokenIndex),
                            action.data,
                            ...state.getTokens.data.slice(existingTokenIndex + 1)
                        ]
                },
                createToken: {
                    ...state.createToken,
                    fetching: false,
                    error: null,
                    data: action.data
                }
            }
        }
        case 'create-token-failed':
            return {
                ...state,
                createToken: {
                    ...state.createToken,
                    fetching: false,
                    error: action.data
                }
            }
        default:
            return state
    }
}

export const tokensSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>> => {
        const boundGetAll = getAll(websocket)
        const boundGet = get(websocket)
        const boundCreate = create(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'get-all-tokens':
                    return boundGetAll(state, action, dispatch)
                case 'get-token':
                    return boundGet(state, action, dispatch)
                case 'create-token':
                    return boundCreate(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('tokens-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-successful', data: JSON.parse(data) })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}


const getAll =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensGetAllAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ tokens: Token[] } | TokensError>('tokens-get-all', undefined)

                if ('reason' in result) {
                    return dispatch({ type: 'get-all-tokens-failed', data: result.reason })
                }

                dispatch({ type: 'get-all-tokens-success', data: result.tokens })
            } catch (error) {
                dispatch({ type: 'get-all-tokens-failed', data: error as string })
            }
        }

const get =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensGetAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ token: Token } | TokensError>('tokens-get', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'get-token-failed', data: result.reason })
                }

                dispatch({ type: 'get-token-success', data: result.token })
            } catch (error) {
                dispatch({ type: 'get-token-failed', data: error as string })
            }
        }

const create =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensCreateAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ token: Token } | TokensError>('tokens-create', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'create-token-failed', data: result.reason })
                }

                dispatch({ type: 'create-token-success', data: result.token })
            } catch (error) {
                dispatch({ type: 'create-token-failed', data: error as string })
            }
        }
