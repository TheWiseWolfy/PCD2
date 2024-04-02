import { useEffect, useRef, useState } from "react"
import { makeDeferredPromise, DeferredPromise } from "../utils/promise"
import { useTimeout } from "./useTimeout"

type Message<T> = {
    action: string
    requestId: undefined | string
    data: T
}

export type ManagedWebSocket = {
    connected: boolean
    request<R, T = unknown>(action: string, data: T): Promise<R>,
    publish<T>(action: string, data: T): void,
    subscribe<T>(action: string, callback: (data: T) => void): void
}

export const useWebSockets = (url: string): ManagedWebSocket => {
    const socket = useRef<WebSocket>()
    const opened = useRef<boolean>(false)
    const [connected, setConnected] = useState(false)
    const [messages, setMessages] = useState<Record<string, Message<any>[]>>({})
    const [requests, setRequests] = useState<Record<string, Message<any>>>({})
    const requestListeners = useRef<Record<string, DeferredPromise<any>>>({})
    const plainListeners = useRef<Record<string, (data: any) => void>>({})

    const request = async <T, R>(action: string, data: T): Promise<R> => {
        if (!socket.current || !opened.current) {
            throw new Error('Socket not connected')
        }

        const deferredPromise = makeDeferredPromise<R>()
        const requestId = crypto.randomUUID()

        requestListeners.current[requestId] = deferredPromise
        socket.current.send(JSON.stringify({
            action,
            requestId,
            data
        }))

        return deferredPromise.promise
    }

    const publish = <T>(action: string, data: T) => {
        if (!socket.current || !opened.current) {
            return
        }

        socket.current.send(JSON.stringify({
            action,
            requestId: undefined,
            data
        }))
    }

    const subscribe = <T>(action: string, callback: (data: T) => void) => {
        if (!socket.current || !opened.current) {
            return
        }

        plainListeners.current[action] = callback
        socket.current.send(JSON.stringify({
            action,
            requestId: undefined,
            data: { channel: action }
        }))
    }

    useWebsocketManager(socket, url, opened, setConnected, setRequests, setMessages)
    useWebSocketMessageQueue(requests, setRequests, messages, setMessages, requestListeners, plainListeners)

    return {
        connected,
        request,
        publish,
        subscribe
    }
}

const useWebsocketManager = (
    socket: { current: undefined | WebSocket },
    url: string,
    opened: { current: boolean },
    setConnected: (value: boolean) => void,
    setRequests: (callback: (requests: Record<string, Message<any>>) => Record<string, Message<any>>) => void,
    setMessages: (callback: (messages: Record<string, Message<any>[]>) => Record<string, Message<any>[]>) => void
) => {
    const interval = useTimeout(
        5000,
        () => {
            if (!socket.current) {
                return
            }

            socket.current.removeEventListener('open', handleOpen)
            socket.current.removeEventListener('close', handleClose)
            socket.current.removeEventListener('error', handleError)
            socket.current.removeEventListener('message', handleMessage)

            socket.current = new WebSocket(url)

            socket.current.addEventListener('open', handleOpen)
            socket.current.addEventListener('close', handleClose)
            socket.current.addEventListener('error', handleError)
            socket.current.addEventListener('message', handleMessage);
        },
        []
    )

    const handleOpen = () => {
        opened.current = true
        setConnected(true)
    }

    const handleClose = () => {
        opened.current = false
        setConnected(false)
        interval.start()
    }

    const handleError = () => {
        opened.current = false
        setConnected(false)
        interval.start()
    }

    const handleMessage = (event: MessageEvent) => {
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
    }

    useEffect(() => {
        if (!socket.current) {
            socket.current = new WebSocket(url)
        }

        socket.current.addEventListener('open', handleOpen)
        socket.current.addEventListener('close', handleClose)
        socket.current.addEventListener('error', handleError)
        socket.current.addEventListener('message', handleMessage)
    }, [])
}


const useWebSocketMessageQueue = (
    requests: Record<string, Message<any>>,
    setRequests: (requests: Record<string, Message<any>>) => void,
    messages: Record<string, Message<any>[]>,
    setMessages: (requests: Record<string, Message<any>[]>) => void,
    requestListeners: { current: Record<string, DeferredPromise<any>> },
    plainListeners: { current: Record<string, (data: any) => void> }
) => {
    useEffect(() => {
        if (Object.values(requests).length > 0) {
            const requestsCopy = { ...requests }

            for (const [requestId, message] of Object.entries(requestsCopy)) {
                const listener = requestListeners.current[requestId]

                if (listener) {
                    listener.resolve(message.data)
                }

                delete requestsCopy[requestId]
            }

            setRequests(requestsCopy)
        }

        if (Object.values(messages).length > 0) {
            const messagesCopy = { ...messages }

            for (const [messageAction, oldMessages] of Object.entries(messagesCopy)) {
                const listener = plainListeners.current[messageAction]

                for (const message of oldMessages) {
                    if (listener) {
                        listener(message.data)
                    }
                }

                delete messagesCopy[messageAction]
            }

            setMessages(messagesCopy)
        }
    }, [requests, messages])
}
