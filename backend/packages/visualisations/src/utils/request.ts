export type Request<T> = {
    event: any,
    route: string
    connectionId: string
    action: string
    requestId: string
    data: T
}

export const makeRequest = <T>(event: any): Request<T> => {
    const body = JSON.parse(event.body)

    return {
        event: event,
        route: event.requestContext.routeKey,
        connectionId: event.requestContext.connectionId,
        action: body.action,
        requestId: body.requestId,
        data: body.data
    }
}
