import React from 'react'
import { DataActions, DataError, DataHydrateAction, DataState, Data, DataGetAction, DataCreateAction, DataCreateSubscribeAction, DataCreateUnsubscribeAction } from './types'
import { ManagedWebSocket } from '../../hooks/useWebSockets'
import { ReducerSideEffect } from '../../hooks/useReducerWithSideEffects'
import { getDataSideEffect, getDataFailedHandler, getDataHandler, getDataSuccessHandler } from './service/get'
import { hydrateSideEffect, hydrateFailedHandler, hydrateSuccessfulHandler } from './service/hydrate'
import { createDataSideEffect, createDataFailedHandler, createDataHandler, createDataSuccessHandler } from './service/create'
import { createDataSubscribeHandler, createDataSubscribeSuccessHandler, createDataSubscribeFailedHandler, createDataSubscribeSideEffect } from './service/subscribe'
import { createDataUnsubscribeHandler, createDataUnsubscribeSuccessHandler, createDataUnsubscribeFailedHandler, createDataUnsubscribeSideEffect } from './service/unsubscribe'


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
            return hydrateSuccessfulHandler(state, action)
        case 'hydrate-failed':
            return hydrateFailedHandler(state, action)
        case 'get-all-data':
            return getDataHandler(state, action)
        case 'get-all-data-success':
            return getDataSuccessHandler(state, action)
        case 'get-all-data-failed':
            return getDataFailedHandler(state, action)
        case 'create-data':
            return createDataHandler(state, action)
        case 'create-data-success':
            return createDataSuccessHandler(state, action)
        case 'create-data-failed':
            return createDataFailedHandler(state, action)
        case 'create-data-subscribe':
            return createDataSubscribeHandler(state, action)
        case 'create-data-subscribe-success':
            return createDataSubscribeSuccessHandler(state, action)
        case 'create-data-subscribe-failed':
            return createDataSubscribeFailedHandler(state, action)
        case 'create-data-unsubscribe':
            return createDataUnsubscribeHandler(state, action)
        case 'create-data-unsubscribe-success':
            return createDataUnsubscribeSuccessHandler(state, action)
        case 'create-data-unsubscribe-failed':
            return createDataUnsubscribeFailedHandler(state, action)
        default:
            return state
    }
}

export const dataSideEffects =
    (websocket: ManagedWebSocket): ReducerSideEffect<React.Reducer<DataState, DataActions>> => {
        const boundHydrate = hydrateSideEffect()
        const boundGetData = getDataSideEffect(websocket)
        const boundCreateData = createDataSideEffect(websocket)
        const boundCreateDataSubscribe = createDataSubscribeSideEffect(websocket)
        const boundCreateDataUnsubscribe = createDataUnsubscribeSideEffect(websocket)

        return (state, action, dispatch) => {
            switch (action.type) {
                case 'hydrate':
                    return boundHydrate(state, action, dispatch)
                case 'get-all-data':
                    return boundGetData(state, action, dispatch)
                case 'create-data':
                    return boundCreateData(state, action, dispatch)
                case 'create-data-subscribe':
                    return boundCreateDataSubscribe(state, action, dispatch)
                case 'create-data-unsubscribe':
                    return boundCreateDataUnsubscribe(state, action, dispatch)
            }
        }
    }

