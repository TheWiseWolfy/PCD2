import React from "react";
import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Project, ProjectsActions, ProjectsCreateSubscribeAction, ProjectsCreateSubscribeFailedAction, ProjectsCreateSubscribeSuccessAction, ProjectsError, ProjectsState } from "../types";

export const createProjectSubscribeHandler = (state: ProjectsState): ProjectsState => ({
    ...state,
    createProjectsSubscribe: {
        ...state.createProjectsSubscribe,
        fetching: true,
        error: null
    }
});

export const createProjectSubscribeSuccessHandler = (state: ProjectsState, action: ProjectsCreateSubscribeSuccessAction): ProjectsState => ({
    ...state,
    createProjectsSubscribe: {
        ...state.createProjectsSubscribe,
        fetching: false,
        error: null,
        data: action.data
    }
});

export const createProjectSubscribeFailedHandler = (state: ProjectsState, action: ProjectsCreateSubscribeFailedAction): ProjectsState => ({
    ...state,
    createProjectsSubscribe: {
        ...state.createProjectsSubscribe,
        fetching: false,
        error: action.data
    }
});

export const subscribe = (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsCreateSubscribeAction> =>
    async (state, action, dispatch) => {
        try {
            const result = await websocket.subscribe<{ project: Project}  | ProjectsError>('projects-create-subscribe', null, (message) => {
                if ('reason' in message) {
                    return
                }

                dispatch({ type: 'create-project-success', data: message.project })
            })

            dispatch({ type: 'create-project-subscribe-success', data: result })
        } catch (error) {
            dispatch({ type: 'create-project-subscribe-failed', data: error as string })
        }
    }
