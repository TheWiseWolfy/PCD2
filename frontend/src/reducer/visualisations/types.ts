import { Subscription } from "../../hooks/useWebSockets"

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
        data: Record<string, Visualisation[]>
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
    createVisualisationsSubscribe: {
        fetching: boolean
        error: null | string
        data: Record<string, Subscription>
    }
    createVisualisationsUnsubscribe: {
        fetching: boolean
        error: null | string
    }
}

export type VisualisationsHydrateAction = { type: 'hydrate' }
export type VisualisationsHydrateSuccessfulAction = { type: 'hydrate-success', data: VisualisationsState }
export type VisualisationsHydrateFailedAction = { type: 'hydrate-failed' }
export type VisualisationsGetAllAction = { type: 'get-all-visualisations', data: { projectId: string } }
export type VisualisationsGetAllSuccessAction = { type: 'get-all-visualisations-success', data: { projectId: string, data: Visualisation[] } }
export type VisualisationsGetAllFailedAction = { type: 'get-all-visualisations-failed', data: string }
export type VisualisationsGetAction = { type: 'get-visualisation', data: { projectId: string, visualisationId: string } }
export type VisualisationsGetSuccessAction = { type: 'get-visualisation-success', data: { projectId: string, data: Visualisation } }
export type VisualisationsGetFailedAction = { type: 'get-visualisation-failed', data: string }
export type VisualisationsCreateAction = { type: 'create-visualisation', data: { projectId: string, name: string, description: string, fn: string } }
export type VisualisationsCreateSuccessAction = { type: 'create-visualisation-success', data: { projectId: string, data: Visualisation } }
export type VisualisationsCreateFailedAction = { type: 'create-visualisation-failed', data: string }
export type VisualisationsCreateSubscribeAction = { type: 'create-visualisation-subscribe', data: { projectId: string } }
export type VisualisationsCreateSubscribeSuccessAction = { type: 'create-visualisation-subscribe-success', data: { projectId: string, subscription: Subscription } }
export type VisualisationsCreateSubscribeFailedAction = { type: 'create-visualisation-subscribe-failed', data: string }
export type VisualisationsCreateUnsubscribeAction = { type: 'create-visualisation-unsubscribe', data: { projectId: string } }
export type VisualisationsCreateUnsubscribeSuccessAction = { type: 'create-visualisation-unsubscribe-success', data: { projectId: string } }
export type VisualisationsCreateUnsubscribeFailedAction = { type: 'create-visualisation-unsubscribe-failed', data: string }
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
    | VisualisationsCreateSubscribeAction
    | VisualisationsCreateSubscribeSuccessAction
    | VisualisationsCreateSubscribeFailedAction
    | VisualisationsCreateUnsubscribeAction
    | VisualisationsCreateUnsubscribeSuccessAction
    | VisualisationsCreateUnsubscribeFailedAction
