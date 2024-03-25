import React from 'react';
import { H3 } from "../../components/typography/h3"
import { P } from "../../components/typography/p"
import { Span } from "../../components/typography/span"
import { Link } from "../../components/image/link"
import { time } from 'console';

interface ProjectStatistics {
    timestamp: string;
    value: number;
}

export const ProjectStatistics: React.FC<ProjectStatistics> = ({ timestamp, value }) => {
    return (
        <Span>
             <P>Timestamp: {timestamp}</P>
             <P>Value: {value}</P>
        </Span>
           
    );
};
