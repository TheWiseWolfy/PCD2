import { Form } from "react-router-dom"
import { Spin } from "../../components/animate/spin"
import { Card } from "../../components/card/card"
import { Header } from "../../components/header/header"
import { HeaderActionSlot } from "../../components/header/headerActionsSlot"
import { Image } from "../../components/image/image"
import { Button } from "../../components/input/button"
import { TextField } from "../../components/input/textfield"
import { List } from "../../components/list/list"
import { Page } from "../../components/page/page"
import { Spacing } from "../../components/spacing/spacing"
import { H1 } from "../../components/typography/h1"
import { useCreateProjectPageLogic } from "./logic"


export const CreateProject: React.FC = () => {
    const logic = useCreateProjectPageLogic()

    return (
        <Page centered={true}>
            <Header left={
                <HeaderActionSlot>
                    <Button onClick={logic.onGoToProjectsList}>
                        <Image id="back" size="m" />
                    </Button>
                </HeaderActionSlot>
            } />
            <Card width={384}>
                <Form onSubmit={logic.onSubmit}>
                    <H1>Create project</H1>
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
                </Form>
            </Card>
        </Page>
    )
}