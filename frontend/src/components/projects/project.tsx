import React from 'react';
import { H3 } from "../typography/h3"
import { P } from "../typography/p"
import { Button } from '../input/button';
import { Card } from '../card/card';
import { Spacing } from '../spacing/spacing';
import { Image } from '../image/image';
import { CardCenteredElement } from '../card/cardCenteredElement';
import { CardSpaceElement } from '../card/cardSpaceElement';
import { ButtonRow } from '../input/buttonRow';

interface Props {
    projectId: string;
    userId: string;
    name: string;
    description: string;

    onGoToProject(): void
    onGoToProjectTokens(): void
}

export const Project: React.FC<Props> = ({ projectId, name, description, onGoToProject, onGoToProjectTokens }) => {
    return (
        <Card width={384}>
            <H3>{name}</H3>
            <CardCenteredElement>
                <Image id="project" size="xl" scaleFactor={5} />
            </CardCenteredElement>
            <Spacing spacing="m" />
            <P>{description}</P>
            <Spacing spacing='s' />
            <CardSpaceElement />
            <ButtonRow>
                <Button onClick={onGoToProject}>Visit</Button>
                <Button onClick={onGoToProjectTokens}>Manage tokens</Button>
            </ButtonRow>
        </Card>
    );
};
