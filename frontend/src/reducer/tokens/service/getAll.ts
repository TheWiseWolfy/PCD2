import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Token, TokensActions, TokensError, TokensGetAllAction, TokensGetAllFailedAction, TokensGetAllSuccessAction, TokensState } from "../types";

export const getAllTokensHandler = (state: TokensState): TokensState => ({
    ...state,
    getTokens: {
        ...state.getTokens,
        fetching: true,
        error: null
    }
});

export const getAllTokensFailedHandler = (state: TokensState, action: TokensGetAllFailedAction): TokensState => ({
    ...state,
    getTokens: {
        ...state.getTokens,
        fetching: false,
        error: action.data,
    }
});

export const getAllTokensSuccessHandler = (state: TokensState, action: TokensGetAllSuccessAction): TokensState => ({
    ...state,
    getTokens: {
        ...state.getTokens,
        fetching: false,
        error: null,
        data: action.data
    }
});

export const getAllTokensSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensGetAllAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ tokens: Token[] } | TokensError>('tokens-get-all', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'get-all-tokens-failed', data: result.reason })
            }

            dispatch({ type: 'get-all-tokens-success', data: result.tokens })
        } catch (error) {
            dispatch({ type: 'get-all-tokens-failed', data: error as string })
        }
    }

