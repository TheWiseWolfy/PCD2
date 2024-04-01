import React, { createContext } from "react";
import { VisualisationsActions, VisualisationsState } from "./types";
import { visualisationsInitialState, visualisationsReducer, visualisationsSideEffects } from "./reducer";
import { useReducerWithSideEffects } from "../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../hooks/useWebSockets";

interface Props {
    websocket: ManagedWebSocket,
    children: React.ReactNode
}

export const VisualisationsContext = createContext<readonly [VisualisationsState, (action: VisualisationsActions) => void]>([visualisationsInitialState, () => undefined])

export const VisualisationsContextProvider: React.FC<Props> = ({ websocket, children }) => {
    const [state, dispatch] = useReducerWithSideEffects(visualisationsReducer, visualisationsSideEffects(websocket), visualisationsInitialState)

    return (
        <VisualisationsContext.Provider value={[state, dispatch]}>
            {children}
        </VisualisationsContext.Provider>
    )
}