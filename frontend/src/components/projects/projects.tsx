import React from 'react';
import { H3 } from "../../components/typography/h3"
import { P } from "../../components/typography/p"
import { Span } from "../../components/typography/span"
import { Link } from "../control/link"

interface Props {
    id: number;
    ownerId: string;
    name: string;
    url: string;
    description: string;
}

export const Project: React.FC<Props> = ({ id, ownerId, name, url, description }) => {
    return (
        <Span>
             <H3>{name}</H3>
             <P>URL: <Link href={url}> {name} </Link></P>
             <P>{description}</P>
        </Span>
           
    );
};
