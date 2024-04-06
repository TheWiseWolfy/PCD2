import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { VisualisationsActions, VisualisationsCreateUnsubscribeAction, VisualisationsCreateUnsubscribeFailedAction, VisualisationsCreateUnsubscribeSuccessAction, VisualisationsState } from "../types";

export const createVisualisationUnsubscribeHandler = (state: VisualisationsState): VisualisationsState => ({
    ...state,
    createVisualisationsUnsubscribe: {
        ...state.createVisualisationsUnsubscribe,
        fetching: true,
        error: null
    }
});

export const createVisualisationUnsubscribeSuccessHandler = (
    state: VisualisationsState,
    action: VisualisationsCreateUnsubscribeSuccessAction
) => {
    const copy = { ...state.createVisualisationsSubscribe.data };
    delete copy[action.data.projectId];

    return {
        ...state,
        createVisualisationsSubscribe: {
            ...state.createVisualisationsSubscribe,
            data: copy
        },
        createVisualisationsUnsubscribe: {
            ...state.createVisualisationsUnsubscribe,
            fetching: false,
            error: null,
        }
    };
};

export const createVisualisationUnsubscribeFailedHandler = (
    state: VisualisationsState,
    action: VisualisationsCreateUnsubscribeFailedAction
): VisualisationsState => ({
    ...state,
    createVisualisationsUnsubscribe: {
        ...state.createVisualisationsUnsubscribe,
        fetching: false,
        error: action.data
    }
});

export const createVisualisationUnsubscribeSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsCreateUnsubscribeAction> =>
    async (state, action, dispatch) => {
        try {
            await state.createVisualisationsSubscribe.data[action.data.projectId]?.unsubscribe()
            dispatch({ type: 'create-visualisation-unsubscribe-success', data: { projectId: action.data.projectId } })
        } catch (error) {
            dispatch({ type: 'create-visualisation-unsubscribe-failed', data: error as string })
        }
    }

