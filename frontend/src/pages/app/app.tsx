import { useEffect } from "react"
import { useAuthenticated } from "../../hooks/useAuthenticated"
import { useNavigate } from "react-router-dom"


export const App: React.FC = () => {
    const navigate = useNavigate()

    useAuthenticated()

    useEffect(() => {
        navigate('/projects')
    }, [])

    return <></>
}