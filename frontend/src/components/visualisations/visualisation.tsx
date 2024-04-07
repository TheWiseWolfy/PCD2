import { FC, useMemo } from "react";
import { Data } from "../../reducer/data/types";
import ReactApexChart from "react-apexcharts";
import { Card } from "../card/card";
import { H3 } from "../typography/h3";
import { Spacing } from "../spacing/spacing";
import { CardCenteredElement } from "../card/cardCenteredElement";
import { H6 } from "../typography/h6";
import { P } from "../typography/p";

interface Props {
    visualisationId: string
    name: string
    description: string
    fn: string
    type?: string
    data: Data[]
}

export const Visualisation: FC<Props> = ({ visualisationId, name, description, fn, type, data }) => {
    const options = useMemo<ReactApexChart['props']['options']>(() => {
        
        const timestamps = (data || []).map(entry => new Date(entry.timestamp))

        return {
            chart: {
                id: visualisationId
            },
            xaxis: {
                categories: timestamps
            }
        }
    }, [data, visualisationId])

    const series = useMemo<ReactApexChart['props']['series']>(() => {
        const series = (data || []).map(entry => entry.value)

        return [
            {
                name,
                data: series
            }
        ]
    }, [data, name])

    return (
        <Card width={384}>
            <H3>{name}</H3>
            <CardCenteredElement>
                <ReactApexChart
                    type={(type as ReactApexChart['props']['type']) || 'area'}
                    options={options}
                    series={series}
                />
            </CardCenteredElement>
            <Spacing spacing="m" />
            {description && (
                <>
                    <H6>Description:</H6>
                    <P>{description}</P>
                </>
            )}
        </Card>
    )
}