import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { UsersContext } from "../../reducer/users/context"
import { NotificationsContext } from "../../reducer/notifications/context"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { TextField } from "../../components/input/textfield"
import { Button } from "../../components/input/button"
import { Image } from "../../components/image/image"
import { Spin } from "../../components/animate/spin"
import { useNotAuthenticated } from "../../hooks/useAuthenticated"
import { Form } from "../../components/input/form"
import { useNavigate } from "react-router-dom"
import { List } from "../../components/list/list"
import { Spacing } from "../../components/spacing/spacing"

export const Login: React.FC = () => {
    const [usersState, usersDispatch] = useContext(UsersContext)
    const [, notificationsDispatch] = useContext(NotificationsContext)
    const [disabled, setDisabled] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const onSubmit = () => {
        usersDispatch({ type: 'login', credentials: { email, password } })
    }

    useNotAuthenticated()

    useEffect(() => {
        if (usersState.fetching) {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [usersState.fetching])

    useEffect(() => {
        if (usersState.isAuthenticated) {
            navigate('/')
        }
    }, [usersState.isAuthenticated])

    useEffect(() => {
        if (!usersState.fetching && usersState.error) {
            notificationsDispatch({
                type: 'notifications-add',
                notification: {
                    type: 'negative',
                    title: 'Login error',
                    description: usersState.error
                }
            })
        }
    }, [usersState.fetching, usersState.error])

    return (
        <Page centered={true}>
            <Card>
                <Form onSubmit={onSubmit}>
                    <H1>Login</H1>
                    <List>
                        <TextField value={email} onChange={setEmail} placeholder="Email" />
                        <TextField value={password} onChange={setPassword} placeholder="Password" masked />
                    </List>
                    <Spacing spacing="m" />
                    <Button disabled={disabled}>
                        {!usersState.fetching
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