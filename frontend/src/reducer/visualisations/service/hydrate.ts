import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import {
    VisualisationsActions,
    VisualisationsHydrateAction,
    VisualisationsHydrateSuccessfulAction,
    VisualisationsState
} from "../types";

export const hydrateSuccessHandler = (action: VisualisationsHydrateSuccessfulAction): VisualisationsState => ({
    ...action.data,
    loading: false,
    getAllVisualisations: {
        ...action.data.getAllVisualisations,
        fetching: false,
        error: null
    },
    getVisualisation: {
        ...action.data.getVisualisation,
        fetching: false,
        error: null
    },
    createVisualisation: {
        ...action.data.createVisualisation,
        fetching: false,
        error: null
    }
});

export const hydrateFailedHandler = (state: VisualisationsState): VisualisationsState => ({
    ...state,
    loading: false,
    getAllVisualisations: {
        ...state.getAllVisualisations,
        fetching: false,
        error: null
    },
    getVisualisation: {
        ...state.getVisualisation,
        fetching: false,
        error: null
    },
    createVisualisation: {
        ...state.createVisualisation,
        fetching: false,
        error: null
    }
});

export const hydrate = (): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsHydrateAction> => (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('visualisations-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-success', data: JSON.parse(data) })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}

