import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects"
import { ManagedWebSocket } from "../../../hooks/useWebSockets"
import { DataState, DataActions, DataCreateSubscribeAction, Data, DataError, DataCreateSubscribeSuccessAction, DataCreateSubscribeFailedAction } from "../types"

export const createDataSubscribeHandler = (state: DataState, action: DataCreateSubscribeAction): DataState => ({
    ...state,
    createDataSubscribe: {
        ...state.createDataSubscribe,
        fetching: true,
        error: null
    }
})

export const createDataSubscribeSuccessHandler = (state: DataState, action: DataCreateSubscribeSuccessAction): DataState => ({
    ...state,
    createDataSubscribe: {
        ...state.createDataSubscribe,
        data: {
            ...state.createDataSubscribe.data,
            [action.data.visualisationId]: action.data.subscription
        }
    }
})

export const createDataSubscribeFailedHandler = (state: DataState, action: DataCreateSubscribeFailedAction): DataState => ({
    ...state,
    createDataSubscribe: {
        ...state.createDataSubscribe,
        fetching: true,
        error: action.data
    }
})

export const createDataSubscribeSideEffect =
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
