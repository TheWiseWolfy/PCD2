import { FC } from "react";
import { Card } from "../card/card";
import { Button } from "../input/button";
import { H3 } from "../typography/h3";

interface Props {
    onGoToCreateVisualisation(): void
}

export const AddMoreVisualisations: FC<Props> = ({ onGoToCreateVisualisation }) => {
    return (
        <Card width={128} centered>
            <H3>Need more?</H3>
            <Button onClick={onGoToCreateVisualisation}>Add more</Button>
        </Card>
    )
}
