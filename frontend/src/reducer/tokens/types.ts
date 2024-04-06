import { Subscription } from "../../hooks/useWebSockets"

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
        data: Record<string, Token[]>
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
    createTokensSubscribe: {
        fetching: boolean
        error: null | string
        data: Record<string, Subscription>
    }
    createTokensUnsubscribe: {
        fetching: boolean
        error: null | string
    }
}

export type TokensHydrateAction = { type: 'hydrate' }
export type TokensHydrateSuccessfulAction = { type: 'hydrate-success', data: TokensState }
export type TokensHydrateFailedAction = { type: 'hydrate-failed' }
export type TokensGetAllAction = { type: 'get-all-tokens', data: { projectId: string } }
export type TokensGetAllSuccessAction = { type: 'get-all-tokens-success', data: { projectId: string, data: Token[] } }
export type TokensGetAllFailedAction = { type: 'get-all-tokens-failed', data: string }
export type TokensGetAction = { type: 'get-token', data: { projectId: string, tokenId: string } }
export type TokensGetSuccessAction = { type: 'get-token-success', data: Token }
export type TokensGetFailedAction = { type: 'get-token-failed', data: string }
export type TokensCreateAction = { type: 'create-token', data: { projectId: string, name: string, description: string } }
export type TokensCreateSuccessAction = { type: 'create-token-success', data: { projectId: string, data: Token } }
export type TokensCreateFailedAction = { type: 'create-token-failed', data: string }
export type TokensCreateSubscribeAction = { type: 'create-token-subscribe', data: { projectId: string } }
export type TokensCreateSubscribeSuccessAction = { type: 'create-token-subscribe-success', data: { projectId: string, subscription: Subscription } }
export type TokensCreateSubscribeFailedAction = { type: 'create-token-subscribe-failed', data: string }
export type TokensCreateUnsubscribeAction = { type: 'create-token-unsubscribe', data: { projectId: string } }
export type TokensCreateUnsubscribeSuccessAction = { type: 'create-token-unsubscribe-success', data: { projectId: string } }
export type TokensCreateUnsubscribeFailedAction = { type: 'create-token-unsubscribe-failed', data: string }
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
    | TokensCreateSubscribeAction
    | TokensCreateSubscribeSuccessAction
    | TokensCreateSubscribeFailedAction
    | TokensCreateUnsubscribeAction
    | TokensCreateUnsubscribeSuccessAction
    | TokensCreateUnsubscribeFailedAction
