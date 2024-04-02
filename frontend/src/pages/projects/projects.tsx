import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { UsersContext } from "../../reducer/users/context"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { useAuthenticated } from "../../hooks/useAuthenticated"
import { Div } from "../../components/typography/div"
import jsonData from '../../resources/data.json'
import { Project } from "../../components/projects/projects"
import { BrowserRouter as Router, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "../../components/input/button"
import { ProjectsContext } from "../../reducer/projects/context"


export const Projects: React.FC = () => {
    const [projectsState, projectsDispatch] = useContext(ProjectsContext)
    const navigate = useNavigate()

    const goToProjectStatistics = (projectId: string) => () => {
        navigate(`/projects/${projectId}/statistics`)
    }

    useAuthenticated()

    useEffect(() => {
        if (projectsState.initial) {
            projectsDispatch({ type: 'projects-get-all' })
        }
    }, [])

    return (
        <Page centered={true}>
            <Card>
                <H1>Projects</H1>
                {projectsState.projects.map((project) => (
                    <Div>
                        <Project
                            id={project.project_id}
                            ownerId={project.user_id}
                            name={project.name}
                            description={project.description}
                        />
                        <Button onClick={goToProjectStatistics(project.project_id)}>Go to Statistics Page</Button>
                    </Div>
                ))}
            </Card>
        </Page >
    )
}