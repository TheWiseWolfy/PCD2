import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { UsersContext } from "../../reducer/users/context"
import { Card } from "../../components/card/card"
import { H1 } from "../../components/typography/h1"
import { TextField } from "../../components/input/textfield"
import { Button } from "../../components/input/button"
import { Image } from "../../components/image/image"
import { Spin } from "../../components/animate/spin"
import { useNotAuthenticated } from "../../hooks/useAuthenticated"
import { Form } from "../../components/input/form"
import { useNavigate } from "react-router-dom"
import { P } from "../../components/typography/p"

export const Login: React.FC = () => {
    const [usersState, usersDispatch] = useContext(UsersContext)
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

    return (
        <Page centered={true}>
            <Card>
                <Form onSubmit={onSubmit}>
                    <H1>Login</H1>
                    <TextField value={email} onChange={setEmail} placeholder="Email" />
                    <TextField value={password} onChange={setPassword} placeholder="Password" />
                    <Button onClick={onSubmit} disabled={disabled}>
                        {!usersState.fetching ? 'Submit' : <Spin><Image id="gear" /></Spin>}
                    </Button>
                    {usersState.error && <P>{usersState.error}</P>}
                </Form>
            </Card>
        </Page>
    )
}