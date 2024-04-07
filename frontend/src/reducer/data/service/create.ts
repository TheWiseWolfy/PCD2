import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects"
import { ManagedWebSocket } from "../../../hooks/useWebSockets"
import { DataState, DataActions, DataCreateAction, Data, DataError, DataCreateSuccessAction, DataCreateFailedAction } from "../types"

export const createDataHandler = (state: DataState, action: DataCreateAction): DataState => ({
    ...state,
    createData: {
        ...state.createData,
        fetching: true,
        error: null
    }
})

export const createDataSuccessHandler = (state: DataState, action: DataCreateSuccessAction): DataState => {
    const original = state.getData.data[action.data.visualisationId] || [action.data.data]
    const existingDataIndex = original.findIndex(item => item.data_id === action.data.data.data_id);
    const copy = original.slice()
    
    if (existingDataIndex === -1) {
        copy.push(action.data.data)
    } else {
        copy.splice(existingDataIndex, 1, action.data.data)
    }

    return {
        ...state,
        getData: {
            ...state.getData,
            data: {
                ...state.getData.data,
                [action.data.visualisationId]: copy
            }
        },
        createData: {
            ...state.createData,
            fetching: false,
            error: null,
            data: action.data.data
        }
    }
}

export const createDataFailedHandler = (state: DataState, action: DataCreateFailedAction): DataState => ({
    ...state,
    createData: {
        ...state.createData,
        fetching: false,
        error: action.data
    }
})

export const createDataSideEffect =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>, DataCreateAction> =>
        async (state, action, dispatch) => {
            try {
                const result = await websocket.request<{ data: Data } | DataError>('create-data', action.data)

                if ('reason' in result) {
                    return dispatch({ type: 'create-data-failed', data: result.reason })
                }

                dispatch({ type: 'create-data-success', data: { visualisationId: action.data.visualisationId, data: result.data } })
            } catch (error) {
                dispatch({ type: 'create-data-failed', data: error as string })
            }
        }
