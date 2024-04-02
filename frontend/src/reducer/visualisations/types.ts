
export type Visualisation = {
    visualisation_id: string
    project_id: string
    name: string
    description: string
}

export type VisualisationsError = {
    reason: string
}

export type VisualisationsState = {
    loading: boolean
    initial: boolean
    fetching: boolean
    error: null | string
    visualisations: Visualisation[]
}

export type VisualisationsHydrateAction = { type: 'hydrate' }
export type VisualisationsHydrateSuccessfulAction = { type: 'hydrate-successful', data: VisualisationsState }
export type VisualisationsHydrateFailedAction = { type: 'hydrate-failed' }
export type VisualisationsGetAllAction = { type: 'visualisations-get-all' }
export type VisualisationsGetAllSuccessAction = { type: 'visualisations-get-all-success', data: Visualisation[] }
export type VisualisationsGetAllFailedAction = { type: 'visualisations-get-all-failed', data: string }
export type VisualisationsGetAction = { type: 'visualisations-get', data: { id: string } }
export type VisualisationsGetSuccessAction = { type: 'visualisations-get-success', data: Visualisation }
export type VisualisationsGetFailedAction = { type: 'visualisations-get-failed', data: string }
export type VisualisationsActions =
    | VisualisationsHydrateAction
    | VisualisationsHydrateSuccessfulAction
    | VisualisationsHydrateFailedAction
    | VisualisationsGetAllAction
    | VisualisationsGetAllSuccessAction
    | VisualisationsGetAllFailedAction
    | VisualisationsGetAction
    | VisualisationsGetSuccessAction
    | VisualisationsGetFailedAction 