import React, { createContext, useEffect, useReducer } from "react";
import { NetActions, NetState } from "./types";
import { netInitialState, netReducer } from "./reducer";
import { useReducerWithSideEffects } from "../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../hooks/useWebSockets";

interface Props {
    websocket: ManagedWebSocket,
    children: React.ReactNode
}

export const NetContext = createContext<readonly [NetState, (action: NetActions) => void]>([netInitialState, () => undefined])

export const NetContextProvider: React.FC<Props> = ({ websocket, children }) => {
    const [state, dispatch] = useReducer(netReducer, netInitialState)

    useEffect(() => {
        switch (websocket.connected) {
            case true:
                dispatch({ type: 'net-connected' })
                break
            case false:
                dispatch({ type: 'net-disconnected' })
                break
        }

    }, [websocket.connected])

    return (
        <NetContext.Provider value={[state, dispatch]}>
            {children}
        </NetContext.Provider>
    )
}