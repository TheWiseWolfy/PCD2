import { svg } from '../../resources/svg'

interface Props {
    id: keyof typeof svg,
}

export const Image: React.FC<Props> = ({ id }) => {
    let Component: React.FunctionComponent<React.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }> = () => <></>

    if (id in svg) {
        Component = svg[id]
    }

    return <Component />
}