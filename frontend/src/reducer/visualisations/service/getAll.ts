import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Visualisation, VisualisationsActions, VisualisationsError, VisualisationsGetAllAction, VisualisationsGetAllFailedAction, VisualisationsGetAllSuccessAction, VisualisationsState } from "../types";

export const getAllVisualisationsHandler = (state: VisualisationsState): VisualisationsState => ({
    ...state,
    getAllVisualisations: {
        ...state.getAllVisualisations,
        fetching: true,
        error: null
    },
});

export const getAllVisualisationsSuccessHandler = (state: VisualisationsState, action: VisualisationsGetAllSuccessAction): VisualisationsState => ({
    ...state,
    getAllVisualisations: {
        ...state.getAllVisualisations,
        fetching: false,
        error: null,
        data: action.data
    },
});

export const getAllVisualisationsFailedHandler = (state: VisualisationsState, action: VisualisationsGetAllFailedAction): VisualisationsState => ({
    ...state,
    getAllVisualisations: {
        ...state.getAllVisualisations,
        fetching: false,
        error: action.data,
    },
});

export const getAllVisualisationsSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsGetAllAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ visualisations: Visualisation[]}  | VisualisationsError>('visualisations-get-all', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'get-all-visualisations-failed', data: result.reason })
            }

            dispatch({ type: 'get-all-visualisations-success', data: result.visualisations })
        } catch (error) {
            dispatch({ type: 'get-all-visualisations-failed', data: error as string })
        }
    }
