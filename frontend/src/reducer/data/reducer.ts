import React from 'react'
import { DataActions, DataError, DataHydrateAction, DataState, Data, DataGetAction, DataCreateAction, DataCreateSubscribeAction, DataCreateUnsubscribeAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const dataInitialState: DataState = ({
    loading: true,
    getData: {
        fetching: false,
        error: null,
        data: []
    },
    createData: {
        fetching: false,
        error: null,
        data: null
    },
    createDataSubscribe: {
        fetching: false,
        error: null,
        data: {}
    },
    createDataUnsubscribe: {
        fetching: false,
        error: null
    }
})

export const dataReducer: React.Reducer<DataState, DataActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-successful':
            return {
                ...action.data,
                loading: false,
                getData: {
                    ...action.data.getData,
                    fetching: false,
                    error: null
                },
                createData: {
                    ...action.data.createData,
                    fetching: false,
                    error: null
                }
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                getData: {
                    ...state.getData,
                    fetching: false,
                    error: null
                },
                createData: {
                    ...state.createData,
                    fetching: false,
                    error: null
                }
            }
        case 'get-all-data':
            return {
                ...state,
                getData: {
                    ...state.getData,
                    fetching: true,
                    error: null
                }
            }
        case 'get-all-data-success':
            return {
                ...state,
                getData: {
                    ...state.getData,
                    fetching: false,
                    error: null,
                    data: action.data
                }
            }
        case 'get-all-data-failed':
            return {
                ...state,
                getData: {
                    ...state.getData,
                    fetching: false,
                    error: action.data
                }
            }
        case 'create-data':
            return {
                ...state,
                createData: {
                    ...state.createData,
                    fetching: true,
                    error: null
                }
            }
        case 'create-data-success': {
            const existingDataIndex = state.getData.data.findIndex(item =>
                item.project_id === action.data.project_id &&
                item.visualisation_id === action.data.visualisation_id &&
                item.timestamp === action.data.timestamp &&
                item.value === action.data.value
            )

            return {
                ...state,
                getData: {
                    ...state.getData,
                    data: existingDataIndex === -1
                        ? [action.data]
                        : [
                            ...state.getData.data.slice(0, existingDataIndex),
                            action.data,
                            ...state.getData.data.slice(existingDataIndex + 1)
                        ]
                },
                createData: {
                    ...state.createData,
                    fetching: false,
                    error: null,
                    data: action.data
                }
            }
        }
        case 'create-data-failed':
            return {
                ...state,
                createData: {
                    ...state.createData,
                    fetching: false,
                    error: action.data
                }
            }
        default:
            return state
    }
}

export const dataSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>> => {
        const boundGet = get(websocket)
        const boundCreate = create(websocket)
        const boundSubscribe = subscribe(websocket)
        const boundUnsubscribe = unsubscribe(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'get-all-data':
                    return boundGet(state, action, dispatch)
                case 'create-data':
                    return boundCreate(state, action, dispatch)
                case 'create-data-subscribe':
                    return boundSubscribe(state, action, dispatch)
                case 'create-data-unsubscribe':
                    return boundUnsubscribe(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<DataState, DataActions>, DataHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('data-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-successful', data: JSON.parse(data) })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}

const get =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataGetAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ data: Data[] } | DataError>('get-all-data', { projectId: action.data.projectId })

                if ('reason' in result) {
                    return dispatch({ type: 'get-all-data-failed', data: result.reason })
                }

                dispatch({ type: 'get-all-data-success', data: result.data })
            } catch (error) {
                dispatch({ type: 'get-all-data-failed', data: error as string })
            }
        }


const create =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataCreateAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ data: Data } | DataError>('create-data', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'create-data-failed', data: result.reason })
                }

                dispatch({ type: 'create-data-success', data: result.data })
            } catch (error) {
                dispatch({ type: 'create-data-failed', data: error as string })
            }
        }

const subscribe =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataCreateSubscribeAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.subscribe<{ data: Data } | DataError, DataCreateSubscribeAction['data']>('data-create-subscribe', action.data, (message) => {
                    if ('reason' in message) {
                        return
                    }

                    dispatch({ type: 'create-data-success', data: message.data })
                })

                dispatch({ type: 'create-data-subscribe-success', data: { visualisationId: action.data.visualisationId, subscription: result } })
            } catch (error) {
                dispatch({ type: 'create-data-subscribe-failed', data: error as string })
            }
        }

const unsubscribe =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataCreateUnsubscribeAction> =>
        async (state, action, dispatch) => {
            try {
                await state.createDataSubscribe.data[action.data.visualisationId]?.unsubscribe()
                dispatch({ type: 'create-data-unsubscribe-success', data: { visualisationId: action.data.visualisationId } })
            } catch (error) {
                dispatch({ type: 'create-data-unsubscribe-failed', data: error as string })
            }
        }



