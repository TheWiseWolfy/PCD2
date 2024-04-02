
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
    initial: boolean
    fetching: boolean
    error: null | string
    data: Data[]
}

export type DataHydrateAction = { type: 'hydrate' }
export type DataHydrateSuccessfulAction = { type: 'hydrate-successful', data: DataState }
export type DataHydrateFailedAction = { type: 'hydrate-failed' }
export type DataGetAction = { type: 'data-get', data: { projectId: string } }
export type DataGetSuccessAction = { type: 'data-get-success', data: Data[] }
export type DataGetFailedAction = { type: 'data-get-failed', data: string }
export type DataCreateAction = { type: 'data-create', data: { projectId: string, value: number } }
export type DataCreateSuccessAction = { type: 'data-create-success', data: Data }
export type DataCreateFailedAction = { type: 'data-create-failed', data: string }
export type DataActions = DataHydrateAction | DataHydrateSuccessfulAction | DataHydrateFailedAction | DataGetAction | DataGetSuccessAction | DataGetFailedAction | DataCreateAction | DataCreateSuccessAction | DataCreateFailedAction