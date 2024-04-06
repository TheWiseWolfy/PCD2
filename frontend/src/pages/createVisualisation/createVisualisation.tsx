import { Form } from "react-router-dom"
import { Spin } from "../../components/animate/spin"
import { Card } from "../../components/card/card"
import { Header } from "../../components/header/header"
import { HeaderActionSlot } from "../../components/header/headerActionsSlot"
import { Image } from "../../components/image/image"
import { Button } from "../../components/input/button"
import { Dropdown } from "../../components/input/dropdown"
import { TextField } from "../../components/input/textfield"
import { List } from "../../components/list/list"
import { Page } from "../../components/page/page"
import { Spacing } from "../../components/spacing/spacing"
import { H1 } from "../../components/typography/h1"
import { useCreateVisualisationPageLogic } from "./logic"


export const CreateVisualisation: React.FC = () => {
    const logic = useCreateVisualisationPageLogic()

    return (
        <Page centered={true}>
            <Header left={
                <HeaderActionSlot>
                    <Button onClick={logic.onGoToVisualisationsList}>
                        <Image id="back" />
                    </Button>
                </HeaderActionSlot>
            } />
            <Card width={384}>
                <Form onSubmit={logic.onSubmit}>
                    <H1>Create visualisation</H1>
                    <List>
                        <TextField value={logic.name} onChange={logic.setName} placeholder="Name" invalid={!logic.nameValid} />
                        <TextField value={logic.description} onChange={logic.setDescription} placeholder="Description" invalid={!logic.descriptionValid} />
                        <Dropdown value={logic.fn} onChange={logic.setFn}>
                            <option value="average">Average</option>
                            <option value="maximum">Maximum</option>
                            <option value="minimum">Minimum</option>
                        </Dropdown>
                    </List>
                    <Spacing spacing="m" />
                    <Button disabled={logic.disabled}>
                        {!logic.fetching
                            ? 'Submit'
                            : <Spin>
                                <Image id="gear" />
                            </Spin>
                        }
                    </Button>
                </Form>
            </Card>
        </Page>
    )
}