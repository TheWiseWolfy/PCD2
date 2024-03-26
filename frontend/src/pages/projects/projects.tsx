import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { AuthContext } from "../../reducer/auth/context"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { useAuthenticated } from "../../hooks/useAuthenticated"
import { Div } from "../../components/typography/div"
import jsonData from '../../resources/data.json'
import { Project } from "../../components/projects/projects"
import { BrowserRouter as Router, Route, Link, useParams } from 'react-router-dom';
import { Button } from "../../components/input/button"


export const Projects: React.FC = () => {
    // useAuthenticated()
    const onSubmit = () => {
    }

    return (
        <Page centered={true}>
            <Card>
                <H1>Projects</H1>
                {jsonData.map((project: any) => (
                    <Div>
                        <Project
                            id={project.id}
                            ownerId={project.ownerId}
                            name={project.name}
                            url={project.url}
                            description={project.description}
                        />
                        <Link to={`/projects/${project.id}/statistics`}>
                            <Button onClick={onSubmit}>Go to Statistics Page</Button>
                        </Link>
                    </Div>
                ))}
            </Card>
        </Page>
    )
}