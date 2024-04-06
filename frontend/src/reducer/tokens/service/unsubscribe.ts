import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { TokensActions, TokensCreateUnsubscribeAction, TokensCreateUnsubscribeFailedAction, TokensCreateUnsubscribeSuccessAction, TokensState } from "../types";

export const createTokenUnsubscribeHandler = (state: TokensState): TokensState => ({
    ...state,
    createTokensUnsubscribe: {
        ...state.createTokensUnsubscribe,
        fetching: true,
        error: null
    }
});

export const createTokenUnsubscribeSuccessHandler = (state: TokensState, action: TokensCreateUnsubscribeSuccessAction) => {
    const copy = { ...state.createTokensSubscribe.data };
    delete copy[action.data.projectId];

    return {
        ...state,
        createTokensSubscribe: {
            ...state.createTokensSubscribe,
            data: copy
        },
        createTokensUnsubscribe: {
            ...state.createTokensUnsubscribe,
            fetching: false,
            error: null,
        }
    };
};

export const createTokenUnsubscribeFailedHandler = (state: TokensState, action: TokensCreateUnsubscribeFailedAction): TokensState => ({
    ...state,
    createTokensUnsubscribe: {
        ...state.createTokensUnsubscribe,
        fetching: false,
        error: action.data
    }
});

export const createTokenUnsubscribeSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<TokensState, TokensActions>, TokensCreateUnsubscribeAction> =>
    async (state, action, dispatch) => {
        try {
            await state.createTokensSubscribe.data[action.data.projectId]?.unsubscribe()
            dispatch({ type: 'create-token-unsubscribe-success', data: { projectId: action.data.projectId } })
        } catch (error) {
            dispatch({ type: 'create-token-unsubscribe-failed', data: error as string })
        }
    }

