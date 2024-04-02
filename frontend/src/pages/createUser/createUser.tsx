import { Page } from "../../components/page/page"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { TextField } from "../../components/input/textfield"
import { Button } from "../../components/input/button"
import { Image } from "../../components/image/image"
import { Spin } from "../../components/animate/spin"
import { Form } from "../../components/input/form"
import { List } from "../../components/list/list"
import { Spacing } from "../../components/spacing/spacing"
import { useCreateUserLogic } from "./logic"

export const CreateUser: React.FC = () => {
    const logic = useCreateUserLogic()

    return (
        <Page centered={true}>
            <Card>
                <Form onSubmit={logic.onSubmit}>
                    <H1>Create user</H1>
                    <List>
                        <TextField value={logic.name} onChange={logic.setName} placeholder="Name" invalid={!logic.nameValid} />
                        <TextField value={logic.email} onChange={logic.setEmail} placeholder="Email" invalid={!logic.emailValid} />
                        <TextField value={logic.password} onChange={logic.setPassword} placeholder="Password" invalid={!logic.passwordValid} masked />
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
                    <Button onClick={logic.onGoToLoginClick}>
                        Go back
                    </Button>
                </Form>
            </Card>
        </Page>
    )
}

