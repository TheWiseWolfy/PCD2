import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UsersContext } from "../../reducer/users/context"
import { ProjectsContext } from "../../reducer/projects/context"
import { DataContext } from "../../reducer/data/context"

export const Root: React.FC = () => {
    const navigate = useNavigate()
    const [usersState, usersDispatch] = useContext(UsersContext)
    const [projectsState, projectsDispatch] = useContext(ProjectsContext)
    const [dataState, dataDispatch] = useContext(DataContext)

    useEffect(() => {
        if (usersState.loading) {
            usersDispatch({ type: 'hydrate' })
        } else if (projectsState.loading) {
            projectsDispatch({ type: 'hydrate' })
        } else if (dataState.loading) {
            dataDispatch({ type: 'hydrate' })
        } else {
            if (!usersState.isAuthenticated) {
                navigate('/login')
            } else {
                navigate('/app')
            }
        }

    }, [usersState, projectsState, dataState])

    return <></>
}