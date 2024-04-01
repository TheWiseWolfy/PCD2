import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UsersContext } from "../../reducer/users/context"
import { VisualisationsContext } from "../../reducer/visualisations/context"
import { ProjectsContext } from "../../reducer/projects/context"
import { DataContext } from "../../reducer/data/context"

export const Root: React.FC = () => {
    const navigate = useNavigate()
    const [usersState, usersDispatch] = useContext(UsersContext)
    const [projectsState, projectsDispatch] = useContext(ProjectsContext)
    const [visualisationsState, visualisationsDispatch] = useContext(VisualisationsContext)
    const [dataState, dataDispatch] = useContext(DataContext)

    useEffect(() => {
        if (usersState.loading) {
            usersDispatch({ type: 'hydrate' })
        } else if (projectsState.loading) {
            projectsDispatch({ type: 'hydrate' })
        } else if (visualisationsState.loading) {
            visualisationsDispatch({ type: 'hydrate' })
        } else if (dataState.loading) {
            dataDispatch({ type: 'hydrate' })
        } else if (!usersState.isAuthenticated) {
            navigate('/login')
            // } else if (!usersState.fetching && usersState.tokens?.auth) {
            //     usersDispatch({ type: 'login', credentials: { auth: usersState.tokens.auth } })
        } else if (usersState.isAuthenticated) {
            navigate('/app')
        }
    }, [usersState, projectsState, visualisationsState, dataState])

    return <></>
}