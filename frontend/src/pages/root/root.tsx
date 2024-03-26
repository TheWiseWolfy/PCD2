import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UsersContext } from "../../reducer/users/context"

export const Root: React.FC = () => {
    const navigate = useNavigate()
    const [usersState, usersDispatch] = useContext(UsersContext)

    useEffect(() => {
        if (usersState.loading) {
            usersDispatch({ type: 'hydrate' })
        } else {
            if (!usersState.isAuthenticated) {
                navigate('/login')
            } else {
                navigate('/app')
            }
        }

    }, [usersState])

    return <></>
}