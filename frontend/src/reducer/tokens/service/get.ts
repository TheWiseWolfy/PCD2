import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Token, TokensActions, TokensError, TokensGetAction, TokensGetFailedAction, TokensGetSuccessAction, TokensState } from "../types";

export const getTokenHandler = (state: TokensState): TokensState => ({
    ...state,
    getToken: {
        ...state.getToken,
        fetching: true,
        error: null
    }
});

export const getTokenSuccessHandler = (state: TokensState, action: TokensGetSuccessAction) => {
    const existingTokenIndex = state.getTokens.data.findIndex(item => item.token_id === action.data.token_id);
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
    };
};

export const getTokenFailedHandler = (state: TokensState, action: TokensGetFailedAction): TokensState => ({
    ...state,
    getToken: {
        ...state.getToken,
        fetching: false,
        error: action.data
    }
});

export const getTokenSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensGetAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ token: Token}  | TokensError>('tokens-get', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'get-token-failed', data: result.reason })
            }

            dispatch({ type: 'get-token-success', data: result.token })
        } catch (error) {
            dispatch({ type: 'get-token-failed', data: error as string })
        }
    }

