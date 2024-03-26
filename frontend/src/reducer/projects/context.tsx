import React, { createContext } from "react";
import { ProjectsActions, ProjectsState } from "./types";
import { projectsInitialState, projectsReducer, projectsSideEffects } from "./reducer";
import { useReducerWithSideEffects } from "../../hooks/useReducerWithSideEffects";
import { ManagedWebSocket } from "../../hooks/useWebSockets";

interface Props {
    websocket: ManagedWebSocket,
    children: React.ReactNode
}

export const ProjectsContext = createContext<readonly [ProjectsState, (action: ProjectsActions) => void]>([projectsInitialState, () => undefined])

export const ProjectsContextProvider: React.FC<Props> = ({ websocket, children }) => {
    const [state, dispatch] = useReducerWithSideEffects(projectsReducer, projectsSideEffects(websocket), projectsInitialState)

    return (
        <ProjectsContext.Provider value={[state, dispatch]}>
            {children}
        </ProjectsContext.Provider>
    )
}