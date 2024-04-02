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
import { useLoginLogic } from "./logic"

export const Login: React.FC = () => {
    const logic = useLoginLogic()

    return (
        <Page centered={true}>
            <Card>
                <Form onSubmit={logic.onSubmit}>
                    <H1>Login</H1>
                    <List>
                        <TextField value={logic.email} onChange={logic.setEmail} placeholder="Email" />
                        <TextField value={logic.password} onChange={logic.setPassword} placeholder="Password" masked />
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
                    <Button onClick={logic.onGoToCreateUserClick}>
                        Create user
                    </Button>
                </Form>
            </Card>
        </Page>
    )
}
