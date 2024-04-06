import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { ProjectsState, ProjectsGetSuccessAction, ProjectsGetFailedAction, Project, ProjectsActions, ProjectsError, ProjectsGetAction } from "../types";

export const getProjectHandler = (state: ProjectsState): ProjectsState => ({
    ...state,
    getProject: {
        ...state.getProject,
        fetching: true,
        error: null
    }
});

export function getProjectSuccessHandler(state: ProjectsState, action: ProjectsGetSuccessAction) {
    const existingProjectIndex = state.getProjects.data.findIndex(item => item.project_id === action.data.project_id);
    return {
        ...state,
        getProjects: {
            ...state.getProjects,
            data: existingProjectIndex === -1
                ? [action.data]
                : [
                    ...state.getProjects.data.slice(0, existingProjectIndex),
                    action.data,
                    ...state.getProjects.data.slice(existingProjectIndex + 1)
                ]
        },
        getProject: {
            ...state.getProject,
            fetching: false,
            error: null,
            data: action.data
        }
    };
}

export const getProjectFailedHandler = (state: ProjectsState, action: ProjectsGetFailedAction): ProjectsState => ({
    ...state,
    getProject: {
        ...state.getProject,
        fetching: false,
        error: action.data
    }
});

export const getProjectSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsGetAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ project: Project } | ProjectsError>('projects-get', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'get-project-failed', data: result.reason })
            }

            dispatch({ type: 'get-project-success', data: result.project })
        } catch (error) {
            dispatch({ type: 'get-project-failed', data: error as string })
        }
    }
