import { CardList } from "../../components/card/cardList";
import { Header } from "../../components/header/header";
import { HeaderActionSlot } from "../../components/header/headerActionsSlot";
import { Image } from "../../components/image/image";
import { Button } from "../../components/input/button";
import { Page } from "../../components/page/page";
import { AddMoreVisualisations } from "../../components/visualisations/addMoreVisualisations";
import { NewVisualisation } from "../../components/visualisations/newVisualisation";
import { useVisualisationsPageLogic } from "./logic";


export const Visualisations: React.FC = () => {
    const logic = useVisualisationsPageLogic()

    return (
        <Page centered={true}>
            <Header left={
                <HeaderActionSlot>
                    <Button onClick={logic.onGoToProjectsList}>
                        <Image id="back" />
                    </Button>
                </HeaderActionSlot>
            } />
            {
                logic.visualisations.length === 0 && (
                    <NewVisualisation onGoToCreateVisualisation={logic.onGoToCreateVisualisation}/>
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
                        <AddMoreVisualisations onGoToCreateVisualisation={logic.onGoToCreateVisualisation}/>
                    </CardList>
                )
            }
        </Page>
    );
};
