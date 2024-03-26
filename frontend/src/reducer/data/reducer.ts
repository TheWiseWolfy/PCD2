import React from 'react'
import { DataActions, DataError, DataHydrateAction, DataState, Data, DataGetAction, DataCreateAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const dataInitialState: DataState = ({
    loading: true,
    initial: true,
    fetching: false,
    error: null,
    data: []
})

export const dataReducer: React.Reducer<DataState, DataActions> = (state, action) => {
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
        case 'data-create':
            return {
                ...state,
                fetching: true,
                error: null
            }
        case 'data-create-success':
            return {
                ...state,
                fetching: false,
                error: null,
                data: [...state.data, action.data]
            }
        case 'data-create-failed':
            return {
                ...state,
                fetching: false,
                error: state.error
            }
        case 'data-get':
            return {
                ...state,
                fetching: true,
                error: null
            }
        case 'data-get-success':
            return {
                ...state,
                initial: true,
                fetching: false,
                error: null,
                data: action.data
            }
        case 'data-get-failed':
            return {
                ...state,
                fetching: false,
                error: state.error
            }
        default:
            return state
    }
}

export const dataSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>> => {
        const boundGet = get(websocket)
        const boundCreate = create(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'data-get':
                    return boundGet(state, action, dispatch)
                case 'data-create':
                    return boundCreate(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<DataState, DataActions>, DataHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('data-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-successful', state: JSON.parse(data) })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}

const get =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataGetAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ data: Data[] } | DataError>('data-get', { projectId: action.data.projectId })

                if ('reason' in result) {
                    return dispatch({ type: 'data-get-failed', error: result.reason })
                }

                dispatch({ type: 'data-get-success', data: result.data })
            } catch (error) {
                dispatch({ type: 'data-get-failed', error: error as string })
            }
        }


const create =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataCreateAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ data: Data } | DataError>('data-create', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'data-create-failed', error: result.reason })
                }

                dispatch({ type: 'data-create-success', data: result.data })
            } catch (error) {
                dispatch({ type: 'data-create-failed', error: error as string })
            }
        }




