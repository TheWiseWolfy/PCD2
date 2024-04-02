
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
}

export type ProjectsHydrateAction = { type: 'hydrate' }
export type ProjectsHydrateSuccessfulAction = { type: 'hydrate-successful', data: ProjectsState }
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
