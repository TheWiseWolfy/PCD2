import React from 'react';
import { Card } from '../card/card';
import { CardCenteredElement } from '../card/cardCenteredElement';
import { CardSpaceElement } from '../card/cardSpaceElement';
import { Image } from '../image/image';
import { Spacing } from '../spacing/spacing';
import { H3 } from "../typography/h3";
import { P } from "../typography/p";

interface Props {
    tokenId: string
    projectId: string
    name: string
    description: string
    token: string
}

export const Token: React.FC<Props> = ({ name, description, token }) => {
    return (
        <Card width={384}>
            <H3>{name}</H3>
            <CardCenteredElement>
                <Image id="key" size="xl" scaleFactor={5} />
            </CardCenteredElement>
            <Spacing spacing="m" />
            <P>{description}</P>
            <P>{token}</P>
            <CardSpaceElement />
        </Card>
    );
};