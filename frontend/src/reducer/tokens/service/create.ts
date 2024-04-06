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
    const existingTokenIndex = state.getTokens.data[action.data.projectId].findIndex(item => item.token_id === action.data.data.token_id);
    return {
        ...state,
        getTokens: {
            ...state.getTokens,
            data: {
                ...state.getTokens.data,
                [action.data.projectId]:
                    existingTokenIndex === -1
                        ? [action.data.data]
                        : [
                            ...state.getTokens.data[action.data.projectId].slice(0, existingTokenIndex),
                            action.data.data,
                            ...state.getTokens.data[action.data.projectId].slice(existingTokenIndex + 1)
                        ]
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

