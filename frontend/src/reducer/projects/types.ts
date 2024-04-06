import { Subscription } from "../../hooks/useWebSockets"

export type Project = {
    project_id: string
    user_id: string
    name: string
    description: string
}

export type ProjectsError = {
    reason: string
}

export type ProjectsState = {
    loading: boolean
    getProjects: {
        fetching: boolean
        error: null | string
        data: Project[]
    }
    getProject: {
        fetching: boolean
        error: null | string
        data: Project | null
    }
    createProject: {
        fetching: boolean
        error: null | string
        data: Project | null
    }
    createProjectsSubscribe: {
        fetching: boolean
        error: null | string
        data: Subscription | null
    }
    createProjectsUnsubscribe: {
        fetching: boolean
        error: null | string
    }
}

export type ProjectsHydrateAction = { type: 'hydrate' }
export type ProjectsHydrateSuccessfulAction = { type: 'hydrate-success', data: ProjectsState }
export type ProjectsHydrateFailedAction = { type: 'hydrate-failed' }
export type ProjectsGetAllAction = { type: 'get-all-projects' }
export type ProjectsGetAllSuccessAction = { type: 'get-all-projects-success', data: Project[] }
export type ProjectsGetAllFailedAction = { type: 'get-all-projects-failed', data: string }
export type ProjectsGetAction = { type: 'get-project', data: { projectId: string } }
export type ProjectsGetSuccessAction = { type: 'get-project-success', data: Project }
export type ProjectsGetFailedAction = { type: 'get-project-failed', data: string }
export type ProjectsCreateAction = { type: 'create-project', data: { name: string, description: string } }
export type ProjectsCreateSuccessAction = { type: 'create-project-success', data: Project }
export type ProjectsCreateFailedAction = { type: 'create-project-failed', data: string }
export type ProjectsCreateSubscribeAction = { type: 'create-project-subscribe' }
export type ProjectsCreateSubscribeSuccessAction = { type: 'create-project-subscribe-success', data: Subscription }
export type ProjectsCreateSubscribeFailedAction = { type: 'create-project-subscribe-failed', data: string }
export type ProjectsCreateUnsubscribeAction = { type: 'create-project-unsubscribe' }
export type ProjectsCreateUnsubscribeSuccessAction = { type: 'create-project-unsubscribe-success' }
export type ProjectsCreateUnsubscribeFailedAction = { type: 'create-project-unsubscribe-failed', data: string }
export type ProjectsActions =
    | ProjectsHydrateAction
    | ProjectsHydrateSuccessfulAction
    | ProjectsHydrateFailedAction
    | ProjectsGetAllAction
    | ProjectsGetAllSuccessAction
    | ProjectsGetAllFailedAction
    | ProjectsGetAction
    | ProjectsGetSuccessAction
    | ProjectsGetFailedAction
    | ProjectsCreateAction
    | ProjectsCreateSuccessAction
    | ProjectsCreateFailedAction
    | ProjectsCreateSubscribeAction
    | ProjectsCreateSubscribeSuccessAction
    | ProjectsCreateSubscribeFailedAction
    | ProjectsCreateUnsubscribeAction
    | ProjectsCreateUnsubscribeSuccessAction
    | ProjectsCreateUnsubscribeFailedAction
