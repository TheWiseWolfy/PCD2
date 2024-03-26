import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { AuthContext } from "../../reducer/auth/context"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { useAuthenticated } from "../../hooks/useAuthenticated"
import { Div } from "../../components/typography/div"
import jsonData from '../../resources/data.json'
import { Project } from "../../components/projects/projects"
import { BrowserRouter as Router, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "../../components/input/button"


export const App: React.FC = () => {
    const navigate = useNavigate()

    useAuthenticated()

    useEffect(() => {
        navigate('/projects')
    }, [])

    return <></>
}