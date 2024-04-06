import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Visualisation, VisualisationsActions, VisualisationsCreateSubscribeAction, VisualisationsCreateSubscribeFailedAction, VisualisationsCreateSubscribeSuccessAction, VisualisationsError, VisualisationsState } from "../types";

export const createVisualisationSubscribeHandler = (state: VisualisationsState): VisualisationsState => ({
    ...state,
    createVisualisationsSubscribe: {
        ...state.createVisualisationsSubscribe,
        fetching: true,
        error: null
    }
});

export const createVisualisationSubscribeSuccessHandler = (
    state: VisualisationsState,
    action: VisualisationsCreateSubscribeSuccessAction
): VisualisationsState => ({
    ...state,
    createVisualisationsSubscribe: {
        ...state.createVisualisationsSubscribe,
        fetching: false,
        error: null,
        data: {
            ...state.createVisualisationsSubscribe.data,
            [action.data.projectId]: action.data.subscription
        }
    }
});

export const createVisualisationSubscribeFailedHandler = (
    state: VisualisationsState,
    action: VisualisationsCreateSubscribeFailedAction
): VisualisationsState => ({
    ...state,
    createVisualisationsSubscribe: {
        ...state.createVisualisationsSubscribe,
        fetching: false,
        error: action.data
    }
});

export const createVisualisationSubscribeSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsCreateSubscribeAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.subscribe<{ visualisation: Visualisation } | VisualisationsError, VisualisationsCreateSubscribeAction['data']>('visualisations-create', action.data, (message) => {
                if ('reason' in message) {
                    return
                }

                dispatch({ type: 'create-visualisation-success', data: message.visualisation })
            })

            dispatch({ type: 'create-visualisation-subscribe-success', data: { projectId: action.data.projectId, subscription: result } })
        } catch (error) {
            dispatch({ type: 'create-visualisation-subscribe-failed', data: error as string })
        }
    }

