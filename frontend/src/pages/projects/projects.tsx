import { Page } from "../../components/page/page";
import { Card } from "../../components/card/card";
import { H1 } from "../../components/typography/h1";
import { Project } from "../../components/projects/project";
import { Button } from "../../components/input/button";
import { useProjectsPageLogic } from "./logic";
import { Spacing } from "../../components/spacing/spacing";
import { CardList } from "../../components/card/cardList";
import { H3 } from "../../components/typography/h3";
import { Image } from "../../components/image/image";


export const Projects: React.FC = () => {
    const logic = useProjectsPageLogic()

    return (
        <Page centered={true}>
            {
                logic.projects.length === 0 && (
                    <>
                        <Card width={192} noBorder noShadow centered>
                            <H1>No project found</H1>
                            <Image id="newProject" />
                            <Spacing spacing="m" />
                            <Button onClick={logic.onGoToCreateProject}>Create a project</Button>
                        </Card>
                    </>
                )
            }
            {
                logic.projects.length > 0 && (
                    <CardList>
                        <>
                            {
                                logic.projects.map(project => (
                                    <Project 
                                        projectId={project.project_id}
                                        userId={project.user_id}
                                        name={project.name}
                                        description={project.description}
                                    />
                                ))
                            }
                        </>
                        <Card width={128} centered>
                            <H3>Need more?</H3>
                            <Button onClick={logic.onGoToCreateProject}>Add more</Button>
                        </Card>
                    </CardList>
                )
            }
        </Page>
    );
};
