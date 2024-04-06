import { Spin } from "../../components/animate/spin"
import { Card } from "../../components/card/card"
import { Header } from "../../components/header/header"
import { HeaderActionSlot } from "../../components/header/headerActionsSlot"
import { Image } from "../../components/image/image"
import { Button } from "../../components/input/button"
import { Form } from "../../components/input/form"
import { TextField } from "../../components/input/textfield"
import { List } from "../../components/list/list"
import { Page } from "../../components/page/page"
import { Spacing } from "../../components/spacing/spacing"
import { H1 } from "../../components/typography/h1"
import { useRegisterLogic } from "./logic"

export const Register: React.FC = () => {
    const logic = useRegisterLogic()

    return (
        <Page centered={true}>
            <Header left={
                <HeaderActionSlot>
                    <Button onClick={logic.onGoToLoginClick}>
                        <Image id="back" size="m" />
                    </Button>
                </HeaderActionSlot>
            } />
            <Card width={384}>
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
                </Form>
            </Card>
        </Page>
    )
}

