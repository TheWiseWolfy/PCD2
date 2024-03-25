export function getRouteKey(event) {
    return event.requestContext.routeKey
}

export function getConnectionId(event) {
    return event.requestContext.connectionId
}
