import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { UsersContext } from "../../reducer/users/context"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { Div } from "../../components/typography/div"
import jsonData from '../../resources/data.json'
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectStatistics } from "../../components/projects/statistics"
import { ProjectsContext } from "../../reducer/projects/context"
import { Project } from "../../reducer/projects/types"
import { DataContext } from "../../reducer/data/context"

export const Statistics: React.FC = () => {
    const [projectsState, dispatchProjects] = useContext(ProjectsContext)
    const [dataState, dispatchData] = useContext(DataContext)
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project>()
    const navigation = useNavigate()

    useEffect(() => {
        const project = projectsState.projects.find(item => item.id === projectId)

        if (project) {
            setProject(project)
        } else {
            navigation('/projects')
        }
    }, [])

    useEffect(() => {
        if (project && dataState.initial) {
            dispatchData({ type: 'data-get', data: { projectId: project.id } })
        }
    }, [project])

    return (
        <Page centered={true}>
            <Card>
                <H1>{project?.name}</H1>
                {dataState.data.map((project: any) => (
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