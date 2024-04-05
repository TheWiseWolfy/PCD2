import { svg } from '../../resources/svg'

interface Props {
    id: keyof typeof svg,
    size?: 'xs' | 's' | 'm' | 'l' | 'xl'
    scaleFactor?: number
}

export const Image: React.FC<Props> = ({ id, size, scaleFactor }) => {
    let Component: React.FunctionComponent<React.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
    }> = () => <></>
    const sizeValue = getComputedStyle(document.documentElement).getPropertyValue(`--${size || 'm'}-size`);
    const computerSizeValue = `calc(${sizeValue} * ${scaleFactor || 1})`

    if (id in svg) {
        Component = svg[id]
    }

    return <Component width={computerSizeValue} height={computerSizeValue} preserveAspectRatio='None' />
}
