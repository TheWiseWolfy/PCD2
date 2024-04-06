import { Subscription } from "../../hooks/useWebSockets"

export type Data = {
    visualisation_id: string
    project_id: string
    value: number
    timestamp: string
}

export type DataError = {
    reason: string
}

export type DataState = {
    loading: boolean
    getData: {
        fetching: boolean
        error: null | string
        data: Data[]
    }
    createData: {
        fetching: boolean
        error: null | string
        data: Data | null
    }
    createDataSubscribe: {
        fetching: boolean
        error: null | string
        data: Record<string, Subscription>
    }
    createDataUnsubscribe: {
        fetching: boolean
        error: null | string
    }
}

export type DataHydrateAction = { type: 'hydrate' }
export type DataHydrateSuccessfulAction = { type: 'hydrate-success', data: DataState }
export type DataHydrateFailedAction = { type: 'hydrate-failed' }
export type DataGetAction = { type: 'get-all-data', data: { projectId: string } }
export type DataGetSuccessAction = { type: 'get-all-data-success', data: Data[] }
export type DataGetFailedAction = { type: 'get-all-data-failed', data: string }
export type DataCreateAction = { type: 'create-data', data: { projectId: string, value: number } }
export type DataCreateSuccessAction = { type: 'create-data-success', data: Data }
export type DataCreateFailedAction = { type: 'create-data-failed', data: string }
export type DataCreateSubscribeAction = { type: 'create-data-subscribe', data: { projectId: string, visualisationId: string } }
export type DataCreateSubscribeSuccessAction = { type: 'create-data-subscribe-success', data: { visualisationId: string, subscription: Subscription } }
export type DataCreateSubscribeFailedAction = { type: 'create-data-subscribe-failed', data: string }
export type DataCreateUnsubscribeAction = { type: 'create-data-unsubscribe', data: { visualisationId: string } }
export type DataCreateUnsubscribeSuccessAction = { type: 'create-data-unsubscribe-success', data: { visualisationId: string } }
export type DataCreateUnsubscribeFailedAction = { type: 'create-data-unsubscribe-failed', data: string }
export type DataActions =
    | DataHydrateAction
    | DataHydrateSuccessfulAction
    | DataHydrateFailedAction
    | DataGetAction
    | DataGetSuccessAction
    | DataGetFailedAction
    | DataCreateAction
    | DataCreateSuccessAction
    | DataCreateFailedAction
    | DataCreateSubscribeAction
    | DataCreateSubscribeSuccessAction
    | DataCreateSubscribeFailedAction
    | DataCreateUnsubscribeAction
    | DataCreateUnsubscribeSuccessAction
    | DataCreateUnsubscribeFailedAction