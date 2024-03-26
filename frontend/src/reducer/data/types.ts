
export type Data = {
    id: string
    project_id: string
    value: number
    timestamp: string
}

export type DataError = {
    reason: string
}

export type DataState = {
    loading: boolean
    fetching: boolean
    error: null | string
    data: Data[]
}

export type DataHydrateAction = { type: 'hydrate' }
export type DataHydrateSuccessfulAction = { type: 'hydrate-successful', state: DataState }
export type DataHydrateFailedAction = { type: 'hydrate-failed' }
export type DataGetAction = { type: 'data-get' }
export type DataGetSuccessAction = { type: 'data-get-success', data: Data[] }
export type DataGetFailedAction = { type: 'data-get-failed', error: string }
export type DataCreateAction = { type: 'data-create', data: { projectId: string, value: number } }
export type DataCreateSuccessAction = { type: 'data-create-success', data: Data }
export type DataCreateFailedAction = { type: 'data-create-failed', error: string }
export type DataActions = DataHydrateAction | DataHydrateSuccessfulAction | DataHydrateFailedAction | DataGetAction | DataGetSuccessAction | DataGetFailedAction | DataCreateAction | DataCreateSuccessAction | DataCreateFailedAction