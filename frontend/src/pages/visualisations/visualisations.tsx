import { Page } from "../../components/page/page";
import { Card } from "../../components/card/card";
import { H1 } from "../../components/typography/h1";
import { Button } from "../../components/input/button";
import { useVisualisationsPageLogic } from "./logic";
import { Spacing } from "../../components/spacing/spacing";
import { CardList } from "../../components/card/cardList";
import { H3 } from "../../components/typography/h3";
import { Image } from "../../components/image/image";


export const Visualisations: React.FC = () => {
    const logic = useVisualisationsPageLogic()

    return (
        <Page centered={true}>
            {
                logic.visualisations.length === 0 && (
                    <>
                        <Card width={192} noBorder noShadow centered>
                            <H1>No visualisation found</H1>
                            <Image id="chart" />
                            <Spacing spacing="m" />
                            <Button onClick={logic.onGoToCreateVisualisation}>Create a visualisation</Button>
                        </Card>
                    </>
                )
            }
            {
                logic.visualisations.length > 0 && (
                    <CardList>
                        <>
                            {
                                logic.visualisations.map(visualisation => (
                                    // <Visualisation 
                                    //     visualisationId={visualisation.visualisation_id}
                                    //     userId={visualisation.user_id}
                                    //     name={visualisation.name}
                                    //     description={visualisation.description}
                                    // />
                                    <></>
                                ))
                            }
                        </>
                        <Card width={128} centered>
                            <H3>Need more?</H3>
                            <Button onClick={logic.onGoToCreateVisualisation}>Add more</Button>
                        </Card>
                    </CardList>
                )
            }
        </Page>
    );
};
