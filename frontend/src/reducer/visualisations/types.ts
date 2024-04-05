
export type Visualisation = {
    visualisation_id: string
    project_id: string
    name: string
    description: string
    fn: string
}

export type VisualisationsError = {
    reason: string
}

export type VisualisationsState = {
    loading: boolean
    getAllVisualisations: {
        fetching: boolean
        error: null | string
        data: Visualisation[]
    }
    getVisualisation: {
        fetching: boolean
        error: null | string
        data: Visualisation | null
    }
    createVisualisation: {
        fetching: boolean
        error: null | string
        data: Visualisation | null
    }
}

export type VisualisationsHydrateAction = { type: 'hydrate' }
export type VisualisationsHydrateSuccessfulAction = { type: 'hydrate-successful', data: VisualisationsState }
export type VisualisationsHydrateFailedAction = { type: 'hydrate-failed' }
export type VisualisationsGetAllAction = { type: 'get-all-visualisations', data: { projectId: string } }
export type VisualisationsGetAllSuccessAction = { type: 'get-all-visualisations-success', data: Visualisation[] }
export type VisualisationsGetAllFailedAction = { type: 'get-all-visualisations-failed', data: string }
export type VisualisationsGetAction = { type: 'get-visualisation', data: { projectId: string, visualisationId: string } }
export type VisualisationsGetSuccessAction = { type: 'get-visualisation-success', data: Visualisation }
export type VisualisationsGetFailedAction = { type: 'get-visualisation-failed', data: string }
export type VisualisationsCreateAction = { type: 'create-visualisation', data: { name: string, description: string, fn: string } }
export type VisualisationsCreateSuccessAction = { type: 'create-visualisation-success', data: Visualisation }
export type VisualisationsCreateFailedAction = { type: 'create-visualisation-failed', data: string }
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
    | VisualisationsCreateAction
    | VisualisationsCreateSuccessAction
    | VisualisationsCreateFailedAction
