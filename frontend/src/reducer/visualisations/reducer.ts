import React from 'react'
import { VisualisationsActions, VisualisationsError, VisualisationsHydrateAction, VisualisationsState, Visualisation, VisualisationsGetAction, VisualisationsGetAllAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const visualisationsInitialState: VisualisationsState = ({
    loading: true,
    initial: true,
    fetching: false,
    error: null,
    visualisations: []
})

export const visualisationsReducer: React.Reducer<VisualisationsState, VisualisationsActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.data,
                loading: false,
                fetching: false
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                fetching: false
            }
        case 'visualisations-get-all':
            return {
                ...state,
                fetching: true,
                error: null
            }
        case 'visualisations-get-all-success':
            return {
                ...state,
                initial: false,
                fetching: false,
                error: null,
                visualisations: action.data
            }
        case 'visualisations-get-all-failed':
            return {
                ...state,
                fetching: false,
                error: action.data,
            }
        case 'visualisations-get':
            return {
                ...state,
                fetching: true,
                error: null
            }
        case 'visualisations-get-success': {
            const existingProjectIndex = state.visualisations.findIndex(item => item.visualisation_id === action.data.visualisation_id)
            return {
                ...state,
                fetching: false,
                error: null,
                visualisations: existingProjectIndex === -1
                    ? [action.data]
                    : [
                        ...state.visualisations.slice(0, existingProjectIndex),
                        action.data,
                        ...state.visualisations.slice(existingProjectIndex + 1)
                    ]
            }
        }
        case 'visualisations-get-failed':
            return {
                ...state,
                fetching: false,
                error: state.error
            }
        default:
            return state
    }
}

export const visualisationsSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>> => {
        const boundGet = get(websocket)
        const boundGetAll = getAll(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'visualisations-get-all':
                    return boundGetAll(state, action, dispatch)
                case 'visualisations-get':
                    return boundGet(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('visualisations-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-successful', data: JSON.parse(data) })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}


const getAll =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsGetAllAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ visualisations: Visualisation[] } | VisualisationsError>('visualisations-get-all', undefined)

                if ('reason' in result) {
                    return dispatch({ type: 'visualisations-get-all-failed', data: result.reason })
                }

                dispatch({ type: 'visualisations-get-all-success', data: result.visualisations })
            } catch (error) {
                dispatch({ type: 'visualisations-get-all-failed', data: error as string })
            }
        }

const get =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsGetAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ project: Visualisation } | VisualisationsError>('visualisations-get', { projectId: action.data })

                if ('reason' in result) {
                    return dispatch({ type: 'visualisations-get-failed', data: result.reason })
                }

                dispatch({ type: 'visualisations-get-success', data: result.project })
            } catch (error) {
                dispatch({ type: 'visualisations-get-failed', data: error as string })
            }
        }




