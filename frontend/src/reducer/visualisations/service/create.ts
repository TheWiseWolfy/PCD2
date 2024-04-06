import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Visualisation, VisualisationsActions, VisualisationsCreateAction, VisualisationsCreateFailedAction, VisualisationsCreateSuccessAction, VisualisationsError, VisualisationsState } from "../types";

export const createVisualisationHandler = (state: VisualisationsState): VisualisationsState => ({
    ...state,
    createVisualisation: {
        ...state.createVisualisation,
        fetching: true,
        error: null
    },
});

export const createVisualisationSuccessHandler = (state: VisualisationsState, action: VisualisationsCreateSuccessAction) => {
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
        createVisualisation: {
            ...state.createVisualisation,
            fetching: false,
            error: null,
            data: action.data
        },
    };
};

export const createVisualisationFailedHandler = (state: VisualisationsState, action: VisualisationsCreateFailedAction): VisualisationsState => ({
    ...state,
    createVisualisation: {
        ...state.createVisualisation,
        fetching: false,
        error: action.data
    },
});

export const createVisualisationSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsCreateAction> =>
    async (state, action, dispatch) => {
        try {
            console.log('here?')
            const result = await websocket.request<{ visualisation: Visualisation}  | VisualisationsError>('visualisations-create', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'create-visualisation-failed', data: result.reason })
            }

            dispatch({ type: 'create-visualisation-success', data: result.visualisation })
        } catch (error) {
            dispatch({ type: 'create-visualisation-failed', data: error as string })
        }
    }

