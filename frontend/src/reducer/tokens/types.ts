
export type Token = {
    token_id: string
    project_id: string
    name: string
    description: string
    token: string
}

export type TokensError = {
    reason: string
}

export type TokensState = {
    loading: boolean
    getTokens: {
        fetching: boolean
        error: null | string
        data: Token[]
    }
    getToken: {
        fetching: boolean
        error: null | string
        data: Token | null
    }
    createToken: {
        fetching: boolean
        error: null | string
        data: Token | null
    }
}

export type TokensHydrateAction = { type: 'hydrate' }
export type TokensHydrateSuccessfulAction = { type: 'hydrate-successful', data: TokensState }
export type TokensHydrateFailedAction = { type: 'hydrate-failed' }
export type TokensGetAllAction = { type: 'get-all-tokens', data: { projectId: string } }
export type TokensGetAllSuccessAction = { type: 'get-all-tokens-success', data: Token[] }
export type TokensGetAllFailedAction = { type: 'get-all-tokens-failed', data: string }
export type TokensGetAction = { type: 'get-token', data: { projectId: string, tokenId: string } }
export type TokensGetSuccessAction = { type: 'get-token-success', data: Token }
export type TokensGetFailedAction = { type: 'get-token-failed', data: string }
export type TokensCreateAction = { type: 'create-token', data: { projectId: string, name: string, description: string } }
export type TokensCreateSuccessAction = { type: 'create-token-success', data: Token }
export type TokensCreateFailedAction = { type: 'create-token-failed', data: string }
export type TokensActions =
    | TokensHydrateAction
    | TokensHydrateSuccessfulAction
    | TokensHydrateFailedAction
    | TokensGetAllAction
    | TokensGetAllSuccessAction
    | TokensGetAllFailedAction
    | TokensGetAction
    | TokensGetSuccessAction
    | TokensGetFailedAction
    | TokensCreateAction
    | TokensCreateSuccessAction
    | TokensCreateFailedAction
