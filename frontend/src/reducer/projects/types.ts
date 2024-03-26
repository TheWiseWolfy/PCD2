
export type Project = {
    id: string
    owner_id: string
    name: string
    description: string
}

export type ProjectsError = {
    reason: string
}

export type ProjectsState = {
    loading: boolean
    fetching: boolean
    error: null | string
    projects: Project[]
}

export type ProjectsHydrateAction = { type: 'hydrate' }
export type ProjectsHydrateSuccessfulAction = { type: 'hydrate-successful', state: ProjectsState }
export type ProjectsHydrateFailedAction = { type: 'hydrate-failed' }
export type ProjectsGetAllAction = { type: 'projects-get-all' }
export type ProjectsGetAllSuccessAction = { type: 'projects-get-all-success', projects: Project[] }
export type ProjectsGetAllFailedAction = { type: 'projects-get-all-failed', error: string }
export type ProjectsGetAction = { type: 'projects-get', project: { id: string } }
export type ProjectsGetSuccessAction = { type: 'projects-get-success', project: Project }
export type ProjectsGetFailedAction = { type: 'projects-get-failed', error: string }
export type ProjectsActions = ProjectsHydrateAction | ProjectsHydrateSuccessfulAction | ProjectsHydrateFailedAction | ProjectsGetAllAction | ProjectsGetAllSuccessAction | ProjectsGetAllFailedAction | ProjectsGetAction | ProjectsGetSuccessAction | ProjectsGetFailedAction 