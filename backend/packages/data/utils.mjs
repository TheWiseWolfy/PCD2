export function getRouteKey(event) {
    return event.requestContext.routeKey
}

export function getConnectionId(event) {
    return event.requestContext.connectionId
}

export function getBody(event) {
    try {
        return JSON.parse(event.body)
    } catch {
        console.error('Body of event is not a valid JSON')
        return null
    }
}

export function getRequestId(body) {
    return body?.requestId
}

export function getData(body) {
    return body?.data
}
