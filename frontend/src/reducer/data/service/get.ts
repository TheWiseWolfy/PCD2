import { ReducerSideEffect } from "../../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../../hooks/useWebSockets";
import { Data, DataActions, DataError, DataGetAction, DataGetFailedAction, DataGetSuccessAction, DataState } from "../types";

export const getDataHandler = (state: DataState, action: DataGetAction): DataState => ({
    ...state,
    getData: {
        ...state.getData,
        fetching: true,
        error: null
    }
})

export const getDataSuccessHandler = (state: DataState, action: DataGetSuccessAction): DataState => ({
    ...state,
    getData: {
        ...state.getData,
        fetching: false,
        error: null,
        data: action.data
    }
})

export const getDataFailedHandler = (state: DataState, action: DataGetFailedAction): DataState => ({
    ...state,
    getData: {
        ...state.getData,
        fetching: false,
        error: action.data
    }
})

export const getDataSideEffect =
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
