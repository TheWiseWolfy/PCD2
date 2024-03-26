import React from 'react'
import { ProjectsActions, ProjectsError, ProjectsHydrateAction, ProjectsState, Project, ProjectsGetAction, ProjectsGetAllAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const projectsInitialState: ProjectsState = ({
    loading: true,
    fetching: false,
    error: null,
    projects: []
})

export const projectsReducer: React.Reducer<ProjectsState, ProjectsActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.state,
                loading: false,
                fetching: false
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                fetching: false
            }
        case 'projects-get-all':
            return {
                ...state,
                fetching: true,
                error: null
            }
        case 'projects-get-all-success':
            return {
                ...state,
                fetching: false,
                error: null,
                projects: action.projects
            }
        case 'projects-get-all-failed':
            return {
                ...state,
                fetching: false,
                error: action.error,
            }
        case 'projects-get':
            return {
                ...state,
                fetching: true,
                error: null
            }
        case 'projects-get-success': {
            const existingProjectIndex = state.projects.findIndex(item => item.id === action.project.id)
            return {
                ...state,
                fetching: false,
                error: null,
                projects: existingProjectIndex === -1
                    ? [action.project]
                    : [
                        ...state.projects.slice(0, existingProjectIndex),
                        action.project,
                        ...state.projects.slice(existingProjectIndex + 1)
                    ]
            }
        }
        case 'projects-get-failed':
            return {
                ...state,
                fetching: false,
                error: state.error
            }
        default:
            return state
    }
}

export const projectsSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>> => {
        const boundGet = get(websocket)
        const boundGetAll = getAll(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'projects-get-all':
                    return boundGetAll(state, action, dispatch)
                case 'projects-get':
                    return boundGet(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('projects-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-successful', state: JSON.parse(data) })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}


const getAll =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsGetAllAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ projects: Project[] } | ProjectsError>('projects-get-all', undefined)

                if ('reason' in result) {
                    return dispatch({ type: 'projects-get-all-failed', error: result.reason })
                }

                dispatch({ type: 'projects-get-all-success', projects: result.projects })
            } catch (error) {
                dispatch({ type: 'projects-get-all-failed', error: error as string })
            }
        }

const get =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsGetAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ project: Project } | ProjectsError>('projects-get', action.project)

                if ('reason' in result) {
                    return dispatch({ type: 'projects-get-failed', error: result.reason })
                }

                dispatch({ type: 'projects-get-success', project: result.project })
            } catch (error) {
                dispatch({ type: 'projects-get-failed', error: error as string })
            }
        }




