import { useCallback, useEffect, useRef, useState } from "react"
import { makeDeferredPromise, DeferredPromise } from "../utils/promise"
import { useTimeout } from "./useTimeout"

type Message<T> = {
    action: string
    requestId: undefined | string
    data: T
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
    const [requestListeners, setRequestListeners] = useState<Record<string, DeferredPromise<any>>>({})
    const [subscriptionListeners, setSubscriptionListeners] = useState<Record<string, SubscriptionListener<any, any>[]>>({})

    const { handleMessage } = useWebSocketMessageQueue(
        requests,
        setRequests,
        messages,
        setMessages,
        requestListeners,
        subscriptionListeners,
    )
    const { socket, connected, connectedRef } = useManagedWebsocket({ url, timeout, handleMessage })

    const request = async <T, R>(action: string, data: T): Promise<R> => {
        if (!socket.current || !connectedRef.current) {
            throw new Error('Socket not connected')
        }

        const deferredPromise = makeDeferredPromise<R>()
        const requestId = crypto.randomUUID()

        setRequestListeners((previousValue) => ({
            ...previousValue,
            [requestId]: deferredPromise
        }))
        socket.current.send(JSON.stringify({
            action,
            requestId,
            data
        }))

        return deferredPromise.promise
    }

    const publish = <T>(action: string, data: T) => {
        if (!socket.current || !connectedRef.current) {
            return
        }

        socket.current.send(JSON.stringify({
            action,
            requestId: undefined,
            data
        }))
    }

    const internalSubscribe = async <T, U = null>(action: string, data: U, callback: SubscriptionCallback<T>) => {
        if (!socket.current || !connectedRef.current) {
            throw new Error('Socket not connected')
        }

        const subscription = { action, data, callback }
        await request(`${action}-subscribe`, data || null)

        return subscription
    }

    const subscribe = async <T, U = null>(action: string, data: U, callback: SubscriptionCallback<T>) => {
        if (!socket.current || !connectedRef.current) {
            throw new Error('Socket not connected')
        }

        const subscription = await internalSubscribe(action, data, callback)

        return {
            unsubscribe: unsubscribe(subscription)
        }
    }

    const unsubscribe = <T, U>(subscription: SubscriptionListener<T, U>) => async () => {
        if (!socket.current || !connectedRef.current) {
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
    }

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
    const socket = useRef<WebSocket | undefined>()
    const connectedRef = useRef(false)
    const [connected, setConnected] = useState(false)
    const interval = useTimeout(
        opts.timeout,
        () => {
            if (socket.current) {
                socket.current.close()

                socket.current.addEventListener('open', internalHandleOpen)
                socket.current.addEventListener('close', internalHandleClose)
                socket.current.addEventListener('error', internalHandleError)
                socket.current.addEventListener('message', internalHandleMessage);
            }

            socket.current = new WebSocket(opts.url)

            socket.current.addEventListener('open', internalHandleOpen)
            socket.current.addEventListener('close', internalHandleClose)
            socket.current.addEventListener('error', internalHandleError)
            socket.current.addEventListener('message', internalHandleMessage);
        },
        [socket]
    )

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

    useEffect(() => {
        socket.current = new WebSocket(opts.url)

        socket.current.addEventListener('open', internalHandleOpen)
        socket.current.addEventListener('close', internalHandleClose)
        socket.current.addEventListener('error', internalHandleError)
        socket.current.addEventListener('message', internalHandleMessage);
    }, [])

    useEffect(() => {
        connectedRef.current = connected
    }, [connected])

    return { socket, connected, connectedRef }
}


const useWebSocketMessageQueue = (
    requests: Record<string, Message<any>>,
    setRequests: React.Dispatch<React.SetStateAction<Record<string, Message<any>>>>,
    messages: Record<string, Message<any>[]>,
    setMessages: React.Dispatch<React.SetStateAction<Record<string, Message<any>[]>>>,
    requestListeners: Record<string, DeferredPromise<any>>,
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
                    listener.resolve(messageEntry.data)
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
