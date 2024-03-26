import { useContext, useEffect } from "react"
import { UsersContext } from "../reducer/users/context"
import { useNavigate } from "react-router-dom"

export const useAuthenticated = () => {
    const [usersState, usersDispatch] = useContext(UsersContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (usersState.loading) {
            usersDispatch({ type: 'hydrate' })
        } else if (!usersState.isAuthenticated) {
            navigate('/')
        }
    }, [usersState])
}

export const useNotAuthenticated = () => {
    const [usersState, usersDispatch] = useContext(UsersContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (usersState.loading) {
            usersDispatch({ type: 'hydrate' })
        } else if (usersState.isAuthenticated) {
            navigate('/')
        }
    }, [usersState])
}