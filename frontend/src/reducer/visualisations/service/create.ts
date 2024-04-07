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

export const createVisualisationSuccessHandler = (state: VisualisationsState, action: VisualisationsCreateSuccessAction): VisualisationsState => {
    const existingVisualisationIndex = state.getAllVisualisations.data[action.data.projectId]?.findIndex(item =>
        item.visualisation_id === action.data.data.visualisation_id
    ) || -1;
    const copy = (state.getAllVisualisations.data[action.data.projectId] || [action.data.data]).slice()
    
    if (existingVisualisationIndex === -1) {
        copy.push(action.data.data)
    } else {
        copy.splice(existingVisualisationIndex, 1, action.data.data)
    }

    return {
        ...state,
        getAllVisualisations: {
            ...state.getAllVisualisations,
            data: {
                ...state.getAllVisualisations.data,
                [action.data.projectId]: copy
            }
        },
        createVisualisation: {
            ...state.createVisualisation,
            fetching: false,
            error: null,
            data: action.data.data
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
            const result = await websocket.request<{ visualisation: Visualisation } | VisualisationsError>('visualisations-create', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'create-visualisation-failed', data: result.reason })
            }

            dispatch({ type: 'create-visualisation-success', data: { projectId: action.data.projectId, data: result.visualisation } })
        } catch (error) {
            dispatch({ type: 'create-visualisation-failed', data: error as string })
        }
    }

