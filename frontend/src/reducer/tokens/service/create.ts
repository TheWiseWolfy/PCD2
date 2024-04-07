import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Token, TokensActions, TokensCreateAction, TokensCreateFailedAction, TokensCreateSuccessAction, TokensError, TokensState } from "../types";

export const createTokenHandler = (state: TokensState): TokensState => ({
    ...state,
    createToken: {
        ...state.createToken,
        fetching: true,
        error: null
    }
});

export const createTokenSuccessHandler = (state: TokensState, action: TokensCreateSuccessAction): TokensState => {
    const original = state.getTokens.data[action.data.projectId] || [action.data.data]
    const existingTokenIndex = original.findIndex(item => item.token_id === action.data.data.token_id);
    const copy = original.slice()

    if (existingTokenIndex === -1) {
        copy.push(action.data.data)
    } else {
        copy.splice(existingTokenIndex, 1, action.data.data)
    }

    return {
        ...state,
        getTokens: {
            ...state.getTokens,
            data: {
                ...state.getTokens.data,
                [action.data.projectId]: copy
            }
        },
        createToken: {
            ...state.createToken,
            fetching: false,
            error: null,
            data: action.data.data
        }
    };
};

export const createTokenFailedHandler = (state: TokensState, action: TokensCreateFailedAction): TokensState => ({
    ...state,
    createToken: {
        ...state.createToken,
        fetching: false,
        error: action.data
    }
});

export const createTokenSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensCreateAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ token: Token } | TokensError>('tokens-create', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'create-token-failed', data: result.reason })
            }

            dispatch({ type: 'create-token-success', data: { projectId: action.data.projectId, data: result.token } })
        } catch (error) {
            dispatch({ type: 'create-token-failed', data: error as string })
        }
    }

