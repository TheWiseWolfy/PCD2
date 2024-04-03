import { Page } from "../../components/page/page"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { Button } from "../../components/input/button"
import { useCreateVisualisationPageLogic } from "./logic"
import { List } from "../../components/list/list"
import { TextField } from "../../components/input/textfield"
import { Spacing } from "../../components/spacing/spacing"
import { Image } from "../../components/image/image"
import { Spin } from "../../components/animate/spin"
import { Form } from "react-router-dom"


export const CreateVisualisation: React.FC = () => {
    const logic = useCreateVisualisationPageLogic()

    return (
        <Page centered={true}>
            <Card>
                <Form onSubmit={logic.onSubmit}>
                    <H1>Create visualisation</H1>
                    <List>
                        <TextField value={logic.name} onChange={logic.setName} placeholder="Name" invalid={!logic.nameValid} />
                        <TextField value={logic.description} onChange={logic.setDescription} placeholder="Description" invalid={!logic.descriptionValid} />
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
                    <Spacing spacing="xs" />
                    <Button onClick={logic.onGoToVisualisationsList}>
                        Go back
                    </Button>
                </Form>
            </Card>
        </Page>
    )
}