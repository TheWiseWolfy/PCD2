import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const Root: React.FC = () => {
    const navigate = useNavigate()

    useEffect(() => {
            navigate('/app/projects')
    }, [])

    return <></>
}