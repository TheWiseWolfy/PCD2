import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects"
import { ManagedWebSocket } from "../../../hooks/useWebSockets"
import { DataActions, DataCreateUnsubscribeAction, DataCreateUnsubscribeFailedAction, DataCreateUnsubscribeSuccessAction, DataState } from "../types"

export const createDataUnsubscribeHandler = (state: DataState, action: DataCreateUnsubscribeAction): DataState => {
    return {
        ...state,
        createDataUnsubscribe: {
            ...state.createDataUnsubscribe,
            fetching: true,
            error: null,
        }
    }
}

export const createDataUnsubscribeSuccessHandler = (state: DataState, action: DataCreateUnsubscribeSuccessAction): DataState => {
    const copy = { ...state.createDataSubscribe.data }
    delete copy[action.data.visualisationId]
    
    return {
        ...state,
        createDataSubscribe: {
            ...state.createDataUnsubscribe,
            data: copy
        },
        createDataUnsubscribe: {
            ...state.createDataUnsubscribe,
            fetching: false,
            error: null,
        }
    }
}

export const createDataUnsubscribeFailedHandler = (state: DataState, action: DataCreateUnsubscribeFailedAction): DataState => {
    return {
        ...state,
        createDataUnsubscribe: {
            ...state.createDataUnsubscribe,
            fetching: false,
            error: action.data,
        }
    }
}


export const createDataUnsubscribeSideEffect =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataCreateUnsubscribeAction> =>
        async (state, action, dispatch) => {
            try {
                await state.createDataSubscribe.data[action.data.visualisationId]?.unsubscribe()
                dispatch({ type: 'create-data-unsubscribe-success', data: { visualisationId: action.data.visualisationId } })
            } catch (error) {
                dispatch({ type: 'create-data-unsubscribe-failed', data: error as string })
            }
        }
