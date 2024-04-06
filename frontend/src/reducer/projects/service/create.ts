import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { ProjectsState, ProjectsCreateSuccessAction, ProjectsCreateFailedAction, Project, ProjectsActions, ProjectsCreateAction, ProjectsError } from "../types";

export const createProjectHandler = (state: ProjectsState): ProjectsState => ({
    ...state,
    createProject: {
        ...state.createProject,
        fetching: true,
        error: null
    }
});

export const createProjectSuccessHandler = (state: ProjectsState, action: ProjectsCreateSuccessAction) => {
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
        createProject: {
            ...state.createProject,
            fetching: false,
            error: null,
            data: action.data
        }
    };
};

export const createProjectFailedHandler = (state: ProjectsState, action: ProjectsCreateFailedAction): ProjectsState => ({
    ...state,
    createProject: {
        ...state.createProject,
        fetching: false,
        error: action.data
    }
});

export const createProjectSideEffect = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsCreateAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.request<{ project: Project } | ProjectsError>('projects-create', action.data)

            if ('reason' in result) {
                return dispatch({ type: 'create-project-failed', data: result.reason })
            }

            dispatch({ type: 'create-project-success', data: result.project })
        } catch (error) {
            dispatch({ type: 'create-project-failed', data: error as string })
        }
    }
