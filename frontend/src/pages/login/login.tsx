import { useContext, useEffect, useState } from "react"
import { Page } from "../../components/page/page"
import { AuthContext } from "../../reducer/auth/context"
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
    const [authState, authDispatch] = useContext(AuthContext)
    const [disabled, setDisabled] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const onSubmit = () => {
        authDispatch({ type: 'login', credentials: { email, password } })
    }

    useNotAuthenticated()

    useEffect(() => {
        if (authState.fetching) {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [authState.fetching])

    useEffect(() => {
        if (authState.isAuthenticated) {
            navigate('/')
        }
    }, [authState.isAuthenticated])

    return (
        <Page centered={true}>
            <Card>
                <Form onSubmit={onSubmit}>
                    <H1>Login</H1>
                    <TextField value={email} onChange={setEmail} placeholder="Email" />
                    <TextField value={password} onChange={setPassword} placeholder="Password" />
                    <Button onClick={onSubmit} disabled={disabled}>
                        {!authState.fetching ? 'Submit' : <Spin><Image id="gear" /></Spin>}
                    </Button>
                    {authState.error && <P>{authState.error}</P>}
                </Form>
            </Card>
        </Page>
    )
}