import React from 'react'
import { VisualisationsActions, VisualisationsError, VisualisationsHydrateAction, VisualisationsState, Visualisation, VisualisationsGetAction, VisualisationsGetAllAction, VisualisationsCreateAction, VisualisationsCreateSubscribeAction, VisualisationsCreateUnsubscribeAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'


export const visualisationsInitialState: VisualisationsState = ({
    loading: true,
    getAllVisualisations: {
        fetching: false,
        error: null,
        data: []
    },
    getVisualisation: {
        fetching: false,
        error: null,
        data: null
    },
    createVisualisation: {
        fetching: false,
        error: null,
        data: null
    },
    createVisualisationsSubscribe: {
        fetching: false,
        error: null,
        data: {}
    },
    createVisualisationsUnsubscribe: {
        fetching: false,
        error: null,
    },
})

export const visualisationsReducer: React.Reducer<VisualisationsState, VisualisationsActions> = (state, action) => {
    switch (action.type) {
        case 'hydrate-success':
            return {
                ...action.data,
                loading: false,
                getAllVisualisations: {
                    ...action.data.getAllVisualisations,
                    fetching: false,
                    error: null
                },
                getVisualisation: {
                    ...action.data.getVisualisation,
                    fetching: false,
                    error: null
                },
                createVisualisation: {
                    ...action.data.createVisualisation,
                    fetching: false,
                    error: null
                }
            }
        case 'hydrate-failed':
            return {
                ...state,
                loading: false,
                getAllVisualisations: {
                    ...state.getAllVisualisations,
                    fetching: false,
                    error: null
                },
                getVisualisation: {
                    ...state.getVisualisation,
                    fetching: false,
                    error: null
                },
                createVisualisation: {
                    ...state.createVisualisation,
                    fetching: false,
                    error: null
                }
            }
        case 'get-all-visualisations':
            return {
                ...state,
                getAllVisualisations: {
                    ...state.getAllVisualisations,
                    fetching: true,
                    error: null
                },
            }
        case 'get-all-visualisations-success':
            return {
                ...state,
                getAllVisualisations: {
                    ...state.getAllVisualisations,
                    fetching: false,
                    error: null,
                    visualisations: action.data
                },
            }
        case 'get-all-visualisations-failed':
            return {
                ...state,
                getAllVisualisations: {
                    ...state.getAllVisualisations,
                    fetching: false,
                    error: action.data,
                },
            }
        case 'get-visualisation':
            return {
                ...state,
                getVisualisation: {
                    ...state.getVisualisation,
                    fetching: true,
                    error: null
                },
            }
        case 'get-visualisation-success': {
            const existingVisualisationIndex = state.getAllVisualisations.data.findIndex(item => item.visualisation_id === action.data.visualisation_id)
            return {
                ...state,
                getAllVisualisations: {
                    ...state.getAllVisualisations,
                    data: existingVisualisationIndex === -1
                        ? [action.data]
                        : [
                            ...state.getAllVisualisations.data.slice(0, existingVisualisationIndex),
                            action.data,
                            ...state.getAllVisualisations.data.slice(existingVisualisationIndex + 1)
                        ]
                },
                getVisualisation: {
                    ...state.getVisualisation,
                    fetching: false,
                    error: null,
                    data: action.data
                },
            }
        }
        case 'get-visualisation-failed':
            return {
                ...state,
                getVisualisation: {
                    ...state.getVisualisation,
                    fetching: false,
                    error: action.data
                },
            }
        case 'create-visualisation':
            return {
                ...state,
                createVisualisation: {
                    ...state.createVisualisation,
                    fetching: true,
                    error: null
                },
            }
        case 'create-visualisation-success': {
            const existingVisualisationIndex = state.getAllVisualisations.data.findIndex(item => item.visualisation_id === action.data.visualisation_id)
            return {
                ...state,
                getAllVisualisations: {
                    ...state.getAllVisualisations,
                    data: existingVisualisationIndex === -1
                        ? [action.data]
                        : [
                            ...state.getAllVisualisations.data.slice(0, existingVisualisationIndex),
                            action.data,
                            ...state.getAllVisualisations.data.slice(existingVisualisationIndex + 1)
                        ]
                },
                createVisualisation: {
                    ...state.createVisualisation,
                    fetching: false,
                    error: null,
                    data: action.data
                },
            }
        }
        case 'create-visualisation-failed':
            return {
                ...state,
                createVisualisation: {
                    ...state.createVisualisation,
                    fetching: false,
                    error: action.data
                },
            }
        case 'create-visualisation-subscribe':
            return {
                ...state,
                createVisualisationsSubscribe: {
                    ...state.createVisualisationsSubscribe,
                    fetching: true,
                    error: null
                }
            }
        case 'create-visualisation-subscribe-success':
            return {
                ...state,
                createVisualisationsSubscribe: {
                    ...state.createVisualisationsSubscribe,
                    fetching: false,
                    error: null,
                    data: {
                        ...state.createVisualisationsSubscribe.data,
                        [action.data.projectId]: action.data.subscription
                    }
                }
            }
        case 'create-visualisation-subscribe-failed':
            return {
                ...state,
                createVisualisationsSubscribe: {
                    ...state.createVisualisationsSubscribe,
                    fetching: false,
                    error: action.data
                }
            }
        case 'create-visualisation-unsubscribe':
            return {
                ...state,
                createVisualisationsUnsubscribe: {
                    ...state.createVisualisationsUnsubscribe,
                    fetching: true,
                    error: null
                }
            }
        case 'create-visualisation-unsubscribe-success': {
            const copy = { ...state.createVisualisationsSubscribe.data }
            delete copy[action.data.projectId]

            return {
                ...state,
                createVisualisationsSubscribe: {
                    ...state.createVisualisationsSubscribe,
                    data: copy
                },
                createVisualisationsUnsubscribe: {
                    ...state.createVisualisationsUnsubscribe,
                    fetching: false,
                    error: null,
                }
            }
        }
        case 'create-visualisation-unsubscribe-failed':
            return {
                ...state,
                createVisualisationsUnsubscribe: {
                    ...state.createVisualisationsUnsubscribe,
                    fetching: false,
                    error: action.data
                }
            }
        default:
            return state
    }
}

export const visualisationsSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>> => {
        const boundGetAll = getAll(websocket)
        const boundGet = get(websocket)
        const boundCreate = create(websocket)
        const boundSubscribe = subscribe(websocket)
        const boundUnsubscribe = unsubscribe(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return hydrate(state, action, dispatch)
                case 'get-all-visualisations':
                    return boundGetAll(state, action, dispatch)
                case 'get-visualisation':
                    return boundGet(state, action, dispatch)
                case 'create-visualisation':
                    return boundCreate(state, action, dispatch)
                case 'create-visualisation-subscribe':
                    return boundSubscribe(state, action, dispatch)
                case 'create-visualisation-unsubscribe':
                    return boundUnsubscribe(state, action, dispatch)
            }
        }
    }

const hydrate: ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsHydrateAction> = (state, action, dispatch) => {
    try {
        const data = localStorage.getItem('visualisations-reducer')

        if (!data) {
            return dispatch({ type: 'hydrate-failed' })
        }

        dispatch({ type: 'hydrate-success', data: JSON.parse(data) })
    } catch {
        dispatch({ type: 'hydrate-failed' })
    }
}


const getAll =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsGetAllAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ visualisations: Visualisation[] } | VisualisationsError>('get-all-visualisations', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'get-all-visualisations-failed', data: result.reason })
                }

                dispatch({ type: 'get-all-visualisations-success', data: result.visualisations })
            } catch (error) {
                dispatch({ type: 'get-all-visualisations-failed', data: error as string })
            }
        }

const get =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsGetAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ visualisation: Visualisation } | VisualisationsError>('get-visualisation', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'get-visualisation-failed', data: result.reason })
                }

                dispatch({ type: 'get-visualisation-success', data: result.visualisation })
            } catch (error) {
                dispatch({ type: 'get-visualisation-failed', data: error as string })
            }
        }

const create =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsCreateAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ visualisation: Visualisation } | VisualisationsError>('create-visualisation', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'create-visualisation-failed', data: result.reason })
                }

                dispatch({ type: 'create-visualisation-success', data: result.visualisation })
            } catch (error) {
                dispatch({ type: 'create-visualisation-failed', data: error as string })
            }
        }

const subscribe =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsCreateSubscribeAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.subscribe<{ visualisation: Visualisation } | VisualisationsError, VisualisationsCreateSubscribeAction['data']>('visualisations-create-subscribe', action.data, (message) => {
                    if ('reason' in message) {
                        return
                    }

                    dispatch({ type: 'create-visualisation-success', data: message.visualisation })
                })

                dispatch({ type: 'create-visualisation-subscribe-success', data: { projectId: action.data.projectId, subscription: result } })
            } catch (error) {
                dispatch({ type: 'create-visualisation-subscribe-failed', data: error as string })
            }
        }


const unsubscribe =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<VisualisationsState, VisualisationsActions>, VisualisationsCreateUnsubscribeAction> =>
        async (state, action, dispatch) => {
            try {
                await state.createVisualisationsSubscribe.data[action.data.projectId]?.unsubscribe()
                dispatch({ type: 'create-visualisation-unsubscribe-success', data: { projectId: action.data.projectId } })
            } catch (error) {
                dispatch({ type: 'create-visualisation-unsubscribe-failed', data: error as string })
            }
        }

