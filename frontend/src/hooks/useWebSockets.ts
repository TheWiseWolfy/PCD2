import { useCallback, useEffect, useRef, useState } from "react"
import { makeDeferredPromise, DeferredPromise } from "../utils/promise"
import { useTimeout } from "./useTimeout"

type Message<T> = {
    action: string
    requestId: undefined | string
    data: T
}
type RequestListener<T, U> = {
    request: {
        requestId: string
        action: string
        data: U
    },
    callback: DeferredPromise<T>
}
type SubscriptionListener<T, U> = {
    action: string
    data: U
    callback: SubscriptionCallback<T>
}
type SubscriptionCallback<T> = (data: T) => void

export type Subscription = {
    unsubscribe(): Promise<void>
}

export type ManagedWebSocket = {
    connected: boolean
    request<R, T = unknown>(action: string, data: T): Promise<R>,
    publish<T>(action: string, data: T): void,
    subscribe<T, U = null>(action: string, data: U, callback: SubscriptionCallback<T>): Promise<Subscription>
}

export const useWebSockets = (url: string, timeout: number): ManagedWebSocket => {
    const [messages, setMessages] = useState<Record<string, Message<any>[]>>({})
    const [requests, setRequests] = useState<Record<string, Message<any>>>({})
    const [requestListeners, setRequestListeners] = useState<Record<string, RequestListener<any, any>>>({})
    const [subscriptionListeners, setSubscriptionListeners] = useState<Record<string, SubscriptionListener<any, any>[]>>({})

    const { handleMessage } = useMessageQueueManager(
        requests,
        setRequests,
        messages,
        setMessages,
        requestListeners,
        subscriptionListeners,
    )
    const { resubscribe } = useSubscriptionManager({
        subscriptionListeners,
        subscribe: (action, data, callback) => {
            internalSubscribe(action, data, callback)
        }
    })
    const { retry } = useRequestManager({
        requestListeners,
        retry: (requestId, action, data) => {
            internalRequest(requestId, action, data)
        }
    })
    const { socket, connected } = useManagedWebsocket({
        url,
        timeout,
        handleOpen: () => {
            retry()
            resubscribe()
        },
        handleMessage: (event) => {
            handleMessage(event)
        },
    })

    const internalRequest = useCallback(<T, R>(requestId: string, action: string, data: T) => {
        if (!socket || !connected) {
            throw new Error('Socket not connected')
        }

        const existingRequestListener = requestListeners[requestId]

        if (existingRequestListener) {
            socket.send(JSON.stringify(existingRequestListener.request))
            return existingRequestListener.callback
        }

        const request = { requestId, action, data }
        const requestListener = { request, callback: makeDeferredPromise<R>() }

        socket.send(JSON.stringify(request))
        setRequestListeners({
            ...requestListeners,
            [requestId]: requestListener
        })

        return requestListener.callback
    }, [socket, connected, requestListeners])

    const request = useCallback(async <T, R>(action: string, data: T): Promise<R> => {
        if (!socket || !connected) {
            throw new Error('Socket not connected')
        }

        const requestId = crypto.randomUUID()
        const requestListener = internalRequest(requestId, action, data)

        return requestListener.promise
    }, [socket, connected])

    const publish = useCallback(<T>(action: string, data: T) => {
        if (!socket || !connected) {
            return
        }

        socket.send(JSON.stringify({
            action,
            requestId: undefined,
            data
        }))
    }, [socket, connected])

    const internalSubscribe = useCallback(async <T, U = null>(action: string, data: U, callback: SubscriptionCallback<T>) => {
        if (!socket || !connected) {
            throw new Error('Socket not connected')
        }

        const subscription = { action, data, callback }
        await request(`${action}-subscribe`, data || null)

        return subscription
    }, [socket, connected])

    const subscribe = useCallback(async <T, U = null>(action: string, data: U, callback: SubscriptionCallback<T>) => {
        if (!socket || !connected) {
            throw new Error('Socket not connected')
        }

        const subscription = await internalSubscribe(action, data, callback)

        return {
            unsubscribe: unsubscribe(subscription)
        }
    }, [socket, connected])

    const unsubscribe = useCallback(<T, U>(subscription: SubscriptionListener<T, U>) => async () => {
        if (!socket || !connected) {
            throw new Error('Socket not connected')
        }

        await request(`${subscription.action}-unsubscribe`, null)

        const index = subscriptionListeners[subscription.action].findIndex(entry => entry === subscription)

        if (index === -1) {
            return
        }

        setSubscriptionListeners(previousValue => {
            const subscriptions = (previousValue[subscription.action] || []).slice()
            subscriptions.splice(index, 1)

            return {
                ...previousValue,
                [subscription.action]: subscriptions
            }
        })
    }, [socket, connected])

    return {
        connected,
        request,
        publish,
        subscribe
    }
}

const useManagedWebsocket = (opts: {
    url: string,
    timeout: number,
    handleOpen?: () => void,
    handleClose?: () => void,
    handleError?: () => void,
    handleMessage?: (event: MessageEvent) => void
}) => {
    const [socket, setSocket] = useState<WebSocket | undefined>()
    const [connected, setConnected] = useState(false)

    const internalHandleOpen = useCallback(() => {
        setConnected(true)
        opts.handleOpen?.()
    }, [])

    const internalHandleClose = useCallback(() => {
        setConnected(false)
        interval.end()
        interval.start()
        opts.handleClose?.()
    }, [])

    const internalHandleError = useCallback(() => {
        setConnected(false)
        interval.end()
        interval.start()
        opts.handleError?.()
    }, [])

    const internalHandleMessage = useCallback((event: MessageEvent) => {
        opts.handleMessage?.(event)
    }, [])

    const interval = useTimeout(
        opts.timeout,
        () => {
            if (socket) {
                socket.close()

                socket.addEventListener('open', internalHandleOpen)
                socket.addEventListener('close', internalHandleClose)
                socket.addEventListener('error', internalHandleError)
                socket.addEventListener('message', internalHandleMessage);
            }

            const newSocket = new WebSocket(opts.url)

            newSocket.addEventListener('open', internalHandleOpen)
            newSocket.addEventListener('close', internalHandleClose)
            newSocket.addEventListener('error', internalHandleError)
            newSocket.addEventListener('message', internalHandleMessage);

            setSocket(newSocket)
        },
        [socket, internalHandleOpen, internalHandleClose, internalHandleError, internalHandleMessage]
    )

    useEffect(() => {
        const newSocket = new WebSocket(opts.url)

        newSocket.addEventListener('open', internalHandleOpen)
        newSocket.addEventListener('close', internalHandleClose)
        newSocket.addEventListener('error', internalHandleError)
        newSocket.addEventListener('message', internalHandleMessage);

        setSocket(newSocket)
    }, [])

    return { socket, connected }
}


const useMessageQueueManager = (
    requests: Record<string, Message<any>>,
    setRequests: React.Dispatch<React.SetStateAction<Record<string, Message<any>>>>,
    messages: Record<string, Message<any>[]>,
    setMessages: React.Dispatch<React.SetStateAction<Record<string, Message<any>[]>>>,
    requestListeners: Record<string, RequestListener<any, any>>,
    subscriptionListeners: Record<string, SubscriptionListener<any, any>[]>
) => {
    const handleMessage = useCallback((event: MessageEvent) => {
        const message = JSON.parse(event.data) as Message<any>
        const requestId = message.requestId
        const messageAction = message.action

        if (requestId) {
            return setRequests(requests => {
                const requestsCopy = { ...requests }
                requestsCopy[requestId] = message
                return requestsCopy
            })
        }

        return setMessages(messages => {
            const messagesCopy = { ...messages }

            if (!(messageAction in messagesCopy)) {
                messagesCopy[messageAction] = []
            }

            messagesCopy[messageAction].push(message)
            return messagesCopy
        })
    }, [])

    useEffect(() => {
        if (Object.values(requests).length > 0) {
            const requestsCopy = { ...requests }

            for (const [requestId, messageEntry] of Object.entries(requestsCopy)) {
                const listener = requestListeners[requestId]

                if (listener) {
                    listener.callback.resolve(messageEntry.data)
                }

                delete requestsCopy[requestId]
            }

            setRequests(requestsCopy)
        }

        if (Object.values(messages).length > 0) {
            const messagesCopy = { ...messages }

            for (const [messageAction, messageEntries] of Object.entries(messagesCopy)) {
                const listeners = subscriptionListeners[messageAction]

                if (!listeners || listeners.length === 0) {
                    delete messagesCopy[messageAction]
                    continue
                }

                for (const message of messageEntries) {
                    for (const listener of listeners) {
                        listener.callback(message.data)
                    }
                }

                delete messagesCopy[messageAction]
            }

            setMessages(messagesCopy)
        }
    }, [requests, messages, subscriptionListeners, requestListeners, setMessages, setRequests])

    return { handleMessage }
}

const useSubscriptionManager = (opts: {
    subscriptionListeners: Record<string, SubscriptionListener<any, any>[]>,
    subscribe: <T, U = null>(action: string, data: U, callback: SubscriptionCallback<T>) => void
}) => {
    const resubscribe = useCallback(() => {
        for (const subscriptionListeners of Object.values(opts.subscriptionListeners)) {
            for (const subscriptionListener of subscriptionListeners) {
                opts.subscribe(subscriptionListener.action, subscriptionListener.data, subscriptionListener.callback)
            }
        }
    }, [opts.subscriptionListeners])

    return { resubscribe }
}

const useRequestManager = (opts: {
    requestListeners: Record<string, RequestListener<any, any>>
    retry: <U = null>(requestId: string, action: string, data: U) => void
}) => {
    const retry = useCallback(() => {
        for (const requestListener of Object.values(opts.requestListeners)) {
            opts.retry(requestListener.request.requestId, requestListener.request.action, requestListener.request.data)
        }
    }, [opts.requestListeners])

    return { retry }
}