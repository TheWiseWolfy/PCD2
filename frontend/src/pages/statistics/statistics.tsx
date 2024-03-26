import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { AuthContext } from "../../reducer/auth/context"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { Div } from "../../components/typography/div"
import jsonData from '../../resources/data.json'
import { useParams } from 'react-router-dom';
import { ProjectStatistics } from "../../components/projects/statistics"

export const Statistics: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();

    return (
        <Page centered={true}>
            <Card>
                <H1>{projectId}</H1>
                {jsonData.map((project: any) => (
                    <Div>
                        <ProjectStatistics
                            timestamp={project.timestamp}
                            value={project.value}
                        />
                    </Div>
                ))}
            </Card>
        </Page>
    )
}