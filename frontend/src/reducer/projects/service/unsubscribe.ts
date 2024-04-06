import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { ProjectsActions, ProjectsCreateUnsubscribeAction, ProjectsCreateUnsubscribeFailedAction, ProjectsState } from "../types";

export const createProjectUnsubscribeHandler = (state: ProjectsState): ProjectsState => ({
    ...state,
    createProjectsUnsubscribe: {
        ...state.createProjectsUnsubscribe,
        fetching: true,
        error: null
    }
});

export const createProjectUnsubscribeSuccessHandler = (state: ProjectsState): ProjectsState => ({
    ...state,
    createProjectsUnsubscribe: {
        ...state.createProjectsUnsubscribe,
        fetching: false,
        error: null,
    }
});

export const createProjectUnsubscribeFailedHandler = (state: ProjectsState, action: ProjectsCreateUnsubscribeFailedAction): ProjectsState => ({
    ...state,
    createProjectsUnsubscribe: {
        ...state.createProjectsUnsubscribe,
        fetching: false,
        error: action.data
    }
});

export const unsubscribe = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsCreateUnsubscribeAction> =>
    async (state, action, dispatch) => {
        try {
            await state.createProjectsSubscribe.data?.unsubscribe()
            dispatch({ type: 'create-project-unsubscribe-success' })
        } catch (error) {
            dispatch({ type: 'create-project-unsubscribe-failed', data: error as string })
        }
    }
