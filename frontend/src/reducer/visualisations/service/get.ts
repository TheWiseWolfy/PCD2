import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Visualisation, VisualisationsActions, VisualisationsError, VisualisationsGetAction, VisualisationsGetFailedAction, VisualisationsGetSuccessAction, VisualisationsState } from "../types";

export const getVisualisationHandler = (state: VisualisationsState): VisualisationsState => ({
    ...state,
    getVisualisation: {
        ...state.getVisualisation,
        fetching: true,
        error: null
    },
});

export const getVisualisationSuccessHandler = (state: VisualisationsState, action: VisualisationsGetSuccessAction) => {
    const existingVisualisationIndex = state.getAllVisualisations.data.findIndex(item => item.visualisation_id === action.data.visualisation_id);
    return {
        ...state,
        getAllVisualisations: {
            ...state.getAllVisualisations,
            data: existingVisualisationIndex === -1
                ? [action.data]
                : [
                    ...state.getAllVisualisations.data.slice(0, existingVisualisationIndex),
                    action.data,
                    ...state.getAllVisualisations.data.slice(existingVisualisationIndex + 1)
                ]
        },
        getVisualisation: {
            ...state.getVisualisation,
            fetching: false,
            error: null,
            data: action.data
        },
    };
};

export const getVisualisationFailedHandler = (state: VisualisationsState, action: VisualisationsGetFailedAction): VisualisationsState => ({
    ...state,
    getVisualisation: {
        ...state.getVisualisation,
        fetching: false,
        error: action.data
    },
});

export const getVisualisationSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsGetAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ visualisation: Visualisation}  | VisualisationsError>('visualisations-get', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'get-visualisation-failed', data: result.reason })
            }

            dispatch({ type: 'get-visualisation-success', data: result.visualisation })
        } catch (error) {
            dispatch({ type: 'get-visualisation-failed', data: error as string })
        }
    }

