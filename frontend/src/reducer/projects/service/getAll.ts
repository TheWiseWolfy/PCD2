import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { ProjectsState, ProjectsGetAllSuccessAction, ProjectsGetAllFailedAction, Project, ProjectsActions, ProjectsError, ProjectsGetAllAction } from "../types";

export const getAllProjectsHandler = (state: ProjectsState): ProjectsState => ({
    ...state,
    getProjects: {
        ...state.getProjects,
        fetching: true,
        error: null
    }
});

export const getAllProjectsSuccessHandler = (state: ProjectsState, action: ProjectsGetAllSuccessAction): ProjectsState => ({
    ...state,
    getProjects: {
        ...state.getProjects,
        fetching: false,
        error: null,
        data: action.data
    }
});

export const getAllProjectsFailedHandler = (state: ProjectsState, action: ProjectsGetAllFailedAction): ProjectsState => ({
    ...state,
    getProjects: {
        ...state.getProjects,
        fetching: false,
        error: action.data,
    }
});

export const getAllProjectsSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsGetAllAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ projects: Project[] } | ProjectsError>('projects-get-all', undefined)

            if ('reason' in result) {
                return dispatch({ type: 'get-all-projects-failed', data: result.reason })
            }

            dispatch({ type: 'get-all-projects-success', data: result.projects })
        } catch (error) {
            dispatch({ type: 'get-all-projects-failed', data: error as string })
        }
    }

