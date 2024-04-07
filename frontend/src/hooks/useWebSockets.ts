import { useCallback, useEffect, useRef, useState } from "react"
import { makeDeferredPromise, DeferredPromise } from "../utils/promise"
import { useTimeout } from "./useTimeout"

type Message<T> = {
    action: string
    requestId: undefined | string
    data: T
}
type PlainListener<T> = (data: T) => void

export type Subscription = {
    unsubscribe(): Promise<void>
}

export type ManagedWebSocket = {
    connected: boolean
    request<R, T = unknown>(action: string, data: T): Promise<R>,
    publish<T>(action: string, data: T): void,
    subscribe<T, U = null>(action: string, data: U, callback: PlainListener<T>): Promise<Subscription>
}

export const useWebSockets = (url: string, timeout: number): ManagedWebSocket => {
    const [messages, setMessages] = useState<Record<string, Message<any>[]>>({})
    const [requests, setRequests] = useState<Record<string, Message<any>>>({})
    const [requestListeners, setRequestListeners] = useState<Record<string, DeferredPromise<any>>>({})
    const [plainListeners, setPlainListeners] = useState<Record<string, PlainListener<any>[]>>({})

    const { socket, connected, connectedRef } = useManagedWebsocket(url, timeout, setRequests, setMessages)
    useWebSocketMessageQueue(
        requests,
        setRequests,
        messages,
        setMessages,
        requestListeners,
        plainListeners,
    )

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

    const subscribe = async <T, U = null>(action: string, data: U, callback: PlainListener<T>) => {
        if (!socket.current || !connectedRef.current) {
            throw new Error('Socket not connected')
        }


        setPlainListeners(previousValue => ({
            ...previousValue,
            [action]: 
                !previousValue[action]
                    ? [callback]
                    : [...previousValue[action], callback]
        }))

        await request(`${action}-subscribe`, data || null)

        return {
            unsubscribe: unsubscribe(
                action,
                callback,
            )
        }
    }

    const unsubscribe = <T>(action: string, callback: PlainListener<T>) => async () => {
        if (!socket.current || !connectedRef.current) {
            throw new Error('Socket not connected')
        }

        await request(`${action}-unsubscribe`, null)

        const index = plainListeners[action].findIndex(entry => entry === callback)

        if (index === -1) {
            return
        }

        setPlainListeners(previousValue => ({
            ...previousValue,
            [action]: [
                ...previousValue[action].slice(0, index),
                ...previousValue[action].slice(index + 1)
            ]
        }))
    }

    return {
        connected,
        request,
        publish,
        subscribe
    }
}

const useManagedWebsocket = (
    url: string,
    timeout: number,
    setRequests: (callback: (requests: Record<string, Message<any>>) => Record<string, Message<any>>) => void,
    setMessages: (callback: (messages: Record<string, Message<any>[]>) => Record<string, Message<any>[]>) => void
) => {
    const socket = useRef<WebSocket | undefined>()
    const connectedRef = useRef(false)
    const [connected, setConnected] = useState(false)
    const interval = useTimeout(
        timeout,
        () => {
            if (socket.current) {
                socket.current.close()

                socket.current.addEventListener('open', handleOpen)
                socket.current.addEventListener('close', handleClose)
                socket.current.addEventListener('error', handleError)
                socket.current.addEventListener('message', handleMessage);
            }

            socket.current = new WebSocket(url)

            socket.current.addEventListener('open', handleOpen)
            socket.current.addEventListener('close', handleClose)
            socket.current.addEventListener('error', handleError)
            socket.current.addEventListener('message', handleMessage);
        },
        []
    )

    const handleOpen = useCallback(() => {
        setConnected(true)
    }, [])

    const handleClose = useCallback(() => {
        setConnected(false)
        interval.end()
        interval.start()
    }, [])

    const handleError = useCallback(() => {
        setConnected(false)
        interval.end()
        interval.start()
    }, [])

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
        socket.current = new WebSocket(url)

        socket.current.addEventListener('open', handleOpen)
        socket.current.addEventListener('close', handleClose)
        socket.current.addEventListener('error', handleError)
        socket.current.addEventListener('message', handleMessage)
    }, [])

    useEffect(() => {
        connectedRef.current = connected
    }, [connected])

    return { socket, connected, connectedRef }
}


const useWebSocketMessageQueue = (
    requests: Record<string, Message<any>>,
    setRequests: (requests: Record<string, Message<any>>) => void,
    messages: Record<string, Message<any>[]>,
    setMessages: (requests: Record<string, Message<any>[]>) => void,
    requestListeners: Record<string, DeferredPromise<any>>,
    plainListeners: Record<string, PlainListener<any>[]>
) => {
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
                const listeners = plainListeners[messageAction]

                if (!listeners || listeners.length === 0) {
                    delete messagesCopy[messageAction]
                    continue
                }

                for (const message of messageEntries) {
                    for (const listener of listeners) {
                        listener(message.data)
                    }
                }

                delete messagesCopy[messageAction]
            }

            setMessages(messagesCopy)
        }
    }, [requests, messages, plainListeners, requestListeners, setMessages, setRequests])
}
