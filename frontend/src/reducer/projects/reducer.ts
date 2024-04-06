import React from 'react'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { createProjectSideEffect, createProjectFailedHandler, createProjectHandler, createProjectSuccessHandler } from './service/create'
import { getProjectFailedHandler, getProjectHandler, getProjectSideEffect, getProjectSuccessHandler } from './service/get'
import { getAllProjectsFailedHandler, getAllProjectsHandler, getAllProjectsSideEffect, getAllProjectsSuccessHandler } from './service/getAll'
import { hydrateFailedHandler, hydrateHandler } from './service/hydrate'
import { createProjectSubscribeFailedHandler, createProjectSubscribeHandler, createProjectSubscribeSuccessHandler, subscribe } from './service/subscribe'
import { createProjectUnsubscribeFailedHandler, createProjectUnsubscribeHandler, createProjectUnsubscribeSuccessHandler, unsubscribe } from './service/unsubscribe'
import { ProjectsActions, ProjectsState } from './types'
import { hydrate } from './service/hydrate'


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
    },
    createProjectsSubscribe: {
        fetching: false,
        error: null,
        data: null
    },
    createProjectsUnsubscribe: {
        fetching: false,
        error: null
    }
})

export const projectsReducer: React.Reducer<ProjectsState, ProjectsActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return hydrateHandler(action)
        case 'hydrate-failed':
            return hydrateFailedHandler(state)
        case 'get-all-projects':
            return getAllProjectsHandler(state)
        case 'get-all-projects-success':
            return getAllProjectsSuccessHandler(state, action)
        case 'get-all-projects-failed':
            return getAllProjectsFailedHandler(state, action)
        case 'get-project':
            return getProjectHandler(state)
        case 'get-project-success':
            return getProjectSuccessHandler(state, action)
        case 'get-project-failed':
            return getProjectFailedHandler(state, action)
        case 'create-project':
            return createProjectHandler(state)
        case 'create-project-success':
            return createProjectSuccessHandler(state, action)
        case 'create-project-failed':
            return createProjectFailedHandler(state, action)
        case 'create-project-subscribe':
            return createProjectSubscribeHandler(state)
        case 'create-project-subscribe-success':
            return createProjectSubscribeSuccessHandler(state, action)
        case 'create-project-subscribe-failed':
            return createProjectSubscribeFailedHandler(state, action)
        case 'create-project-unsubscribe':
            return createProjectUnsubscribeHandler(state)
        case 'create-project-unsubscribe-success':
            return createProjectUnsubscribeSuccessHandler(state)
        case 'create-project-unsubscribe-failed':
            return createProjectUnsubscribeFailedHandler(state, action)
        default:
            return state
    }
}

export const projectsSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<ProjectsState, ProjectsActions>> => {
        const boundGetAllProjects = getAllProjectsSideEffect(websocket)
        const boundGetProject = getProjectSideEffect(websocket)
        const boundCreateProject = createProjectSideEffect(websocket)
        const boundCreateProjectSubscribe = subscribe(websocket)
        const boundCreateProjectUnsubscribe = unsubscribe(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'get-all-projects':
                    return boundGetAllProjects(state, action, dispatch)
                case 'get-project':
                    return boundGetProject(state, action, dispatch)
                case 'create-project':
                    return boundCreateProject(state, action, dispatch)
                case 'create-project-subscribe':
                    return boundCreateProjectSubscribe(state, action, dispatch)
                case 'create-project-unsubscribe':
                    return boundCreateProjectUnsubscribe(state, action, dispatch)
            }
        }
    }
