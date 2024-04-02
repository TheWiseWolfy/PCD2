import React from 'react';
import { H3 } from "../typography/h3"
import { P } from "../typography/p"
import { useNavigate } from 'react-router-dom';
import { Button } from '../input/button';
import { Card } from '../card/card';
import { Spacing } from '../spacing/spacing';

interface Props {
    projectId: string;
    userId: string;
    name: string;
    description: string;
}

export const Project: React.FC<Props> = ({ projectId, name, description }) => {
    const navigate = useNavigate()

    const onClick = () => {
        navigate(`/app/projects/${projectId}`)
    }

    return (
        <Card width={128}>
            <H3>{name}</H3>
            <P>{description}</P>
            <Spacing spacing='s' />
            <Button onClick={onClick}>Visit</Button>
        </Card>
    );
};
