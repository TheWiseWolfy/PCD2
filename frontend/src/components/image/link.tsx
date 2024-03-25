import React from 'react';

interface Props {
    href: string;
    target?: string;
    className?: string;
    children: React.ReactNode|string;
}

export const Link: React.FC<Props> = ({ href, target, className, children }) => {
    return (
        <a href={href} target={target} className={className}>
            {children}
        </a>
    );
};
