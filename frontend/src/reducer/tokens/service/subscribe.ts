import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Token, TokensActions, TokensCreateSubscribeAction, TokensCreateSubscribeFailedAction, TokensCreateSubscribeSuccessAction, TokensError, TokensState } from "../types";

export const createTokenSubscribeHandler = (state: TokensState): TokensState => ({
    ...state,
    createTokensSubscribe: {
        ...state.createTokensSubscribe,
        fetching: true,
        error: null
    }
});

export const createTokenSubscribeSuccessHandler = (state: TokensState, action: TokensCreateSubscribeSuccessAction): TokensState => ({
    ...state,
    createTokensSubscribe: {
        ...state.createTokensSubscribe,
        fetching: false,
        error: null,
        data: {
            ...state.createTokensSubscribe.data,
            [action.data.projectId]: action.data.subscription
        }
    }
});

export const createTokenSubscribeFailedHandler = (state: TokensState, action: TokensCreateSubscribeFailedAction): TokensState => ({
    ...state,
    createTokensSubscribe: {
        ...state.createTokensSubscribe,
        fetching: false,
        error: action.data
    }
});

export const createTokenSubscribeSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensCreateSubscribeAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.subscribe<{ token: Token } | TokensError, TokensCreateSubscribeAction['data']>('tokens-create', action.data, (message) => {
                if ('reason' in message) {
                    return
                }

                dispatch({ type: 'create-token-success', data: { projectId: message.token.project_id, data: message.token } })
            })

            dispatch({ type: 'create-token-subscribe-success', data: { projectId: action.data.projectId, subscription: result } })
        } catch (error) {
            dispatch({ type: 'create-token-subscribe-failed', data: error as string })
        }
    }

