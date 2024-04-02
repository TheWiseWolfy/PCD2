import React from 'react'
import { ProjectsActions, ProjectsError, ProjectsHydrateAction, ProjectsState, Project, ProjectsGetAction, ProjectsGetAllAction, ProjectsCreateAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const projectsInitialState: ProjectsState = ({
    loading: true,
    getProjects: {
        fetching: false,
        error: null,
        data: []
    },
    getProject: {
        fetching: false,
        error: null,
        data: null
    },
    createProject: {
        fetching: false,
        error: null,
        data: null
    }
})

export const projectsReducer: React.Reducer<ProjectsState, ProjectsActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.data,
                loading: false,
                getProjects: {
                    ...action.data.getProjects,
                    error: null,
                    fetching: false
                },
                getProject: {
                    ...action.data.getProject,
                    error: null,
                    fetching: false
                }
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                getProjects: {
                    ...state.getProjects,
                    error: null,
                    fetching: false
                },
                getProject: {
                    ...state.getProject,
                    error: null,
                    fetching: false
                }
            }
        case 'get-all-projects':
            return {
                ...state,
                getProjects: {
                    ...state.getProjects,
                    fetching: true,
                    error: null
                }
            }
        case 'get-all-projects-success':
            return {
                ...state,
                getProjects: {
                    ...state.getProjects,
                    fetching: false,
                    error: null,
                    data: action.data
                }
            }
        case 'get-all-projects-failed':
            return {
                ...state,
                getProjects: {
                    ...state.getProjects,
                    fetching: false,
                    error: action.data,
                }
            }
        case 'get-project':
            return {
                ...state,
                getProject: {
                    ...state.getProject,
                    fetching: true,
                    error: null
                }
            }
        case 'get-project-success': {
            const existingProjectIndex = state.getProjects.data.findIndex(item => item.project_id === action.data.project_id)
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
            }
        }
        case 'get-project-failed':
            return {
                ...state,
                getProject: {
                    ...state.getProject,
                    fetching: false,
                    error: action.data
                }
            }
        case 'create-project':
            return {
                ...state,
                createProject: {
                    ...state.createProject,
                    fetching: true,
                    error: null
                }
            }
        case 'create-project-success':
            return {
                ...state,
                createProject: {
                    ...state.createProject,
                    fetching: false,
                    error: null,
                    data: action.data
                }
            }
        case 'create-project-failed':
            return {
                ...state,
                createProject: {
                    ...state.createProject,
                    fetching: false,
                    error: action.data
                }
            }
        default:
            return state
    }
}

export const projectsSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>> => {
        const boundGetAll = getAll(websocket)
        const boundGet = get(websocket)
        const boundCreate = create(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'get-all-projects':
                    return boundGetAll(state, action, dispatch)
                case 'get-project':
                    return boundGet(state, action, dispatch)
                case 'create-project':
                    return boundCreate(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('projects-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-successful', data: JSON.parse(data) })
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
                    return dispatch({ type: 'get-all-projects-failed', data: result.reason })
                }

                dispatch({ type: 'get-all-projects-success', data: result.projects })
            } catch (error) {
                dispatch({ type: 'get-all-projects-failed', data: error as string })
            }
        }

const get =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsGetAction> =>
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

const create =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>, ProjectsCreateAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ project: Project } | ProjectsError>('projects-create', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'get-project-failed', data: result.reason })
                }

                dispatch({ type: 'get-project-success', data: result.project })
            } catch (error) {
                dispatch({ type: 'get-project-failed', data: error as string })
            }
        }
