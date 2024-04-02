import { useCallback, useContext, useEffect, useState } from "react"
import { UsersContext } from "../reducer/users/context"
import { DataContext } from "../reducer/data/context"
import { ProjectsContext } from "../reducer/projects/context"
import { VisualisationsContext } from "../reducer/visualisations/context"
import { NetContext } from "../reducer/net/context"

export const useLoadReducers = () => {
    const [areReducersLoaded, setAreReducersLoaded] = useState(false)
    const [usersState, usersDispatch] = useContext(UsersContext)
    const [projectsState, projectsDispatch] = useContext(ProjectsContext)
    const [visualisationsState, visualisationsDispatch] = useContext(VisualisationsContext)
    const [dataState, dataDispatch] = useContext(DataContext)
    const [netState,] = useContext(NetContext)

    const run = useCallback(() => {
        if (areReducersLoaded) {
            return
        }

        if (usersState.loading) {
            return usersDispatch({ type: 'hydrate' })
        }

        if (projectsState.loading) {
            return projectsDispatch({ type: 'hydrate' })
        }

        if (visualisationsState.loading) {
            return visualisationsDispatch({ type: 'hydrate' })
        }

        if (dataState.loading) {
            return dataDispatch({ type: 'hydrate' })
        }

        if (!netState.connected) {
            return
        }

        setAreReducersLoaded(true)
    }, [areReducersLoaded, usersState, projectsState, visualisationsState, dataState, netState])

    useEffect(
        () => { run() },
        [areReducersLoaded, usersState, projectsState, visualisationsState, dataState, netState]
    )

    return areReducersLoaded
}
