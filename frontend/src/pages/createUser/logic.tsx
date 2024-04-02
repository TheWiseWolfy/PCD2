import { useContext, useEffect, useState } from "react";
import { UsersContext } from "../../reducer/users/context";
import { NotificationsContext } from "../../reducer/notifications/context";
import { useNotAuthenticated } from "../../hooks/useAuthenticated";
import { useNavigate } from "react-router-dom";
import { PageState } from "../../common/page/types";

export const useCreateUserLogic = () => {
    const [usersState, usersDispatch] = useContext(UsersContext);
    const [, notificationsDispatch] = useContext(NotificationsContext);
    const [pageState, setPageState] = useState<PageState>(PageState.Initial)
    const [disabled, setDisabled] = useState(false);
    const [name, setName] = useState('');
    const [nameValid, setNameValid] = useState(true);
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(true);
    const [password, setPassword] = useState('');
    const [passwordValid, setPasswordValid] = useState(true);
    const navigate = useNavigate();

    const onSubmit = () => {
        usersDispatch({ type: 'create-user', user: { email, name, password } });
        setPageState(PageState.Fetching)
    };

    const onGoToLoginClick = () => {
        navigate('/login');
    };

    useNotAuthenticated();

    useEffect(() => {
        setNameValid(name.length > 0);
        setEmailValid(/.+?@.+?\..+?/.test(email));
        setPasswordValid(password.length > 7);
    }, [email, name, password]);

    useEffect(() => {
        switch (pageState) {
            case PageState.Loading:
            case PageState.Fetching:
                setDisabled(true)
                break
            case PageState.Failed:
                setDisabled(false)
                notificationsDispatch({
                    type: 'notifications-add',
                    notification: {
                        type: 'negative',
                        title: 'User creation error',
                        description: usersState.createUser.error || ''
                    }
                })
                break
            case PageState.Successful:
                setDisabled(false)
                notificationsDispatch({
                    type: 'notifications-add',
                    notification: {
                        type: 'positive',
                        title: 'User creation succeeded',
                        description: 'Navigating back to login page'
                    }
                })
                navigate('/login');
                break
            default:
                setDisabled(false)
        }
    }, [pageState])

    useEffect(() => {
        if (pageState !== PageState.Initial) {
            if (!usersState.createUser.fetching && usersState.createUser.error) {
                setPageState(PageState.Failed);
            } else if (!usersState.createUser.fetching && !usersState.createUser.error && usersState.createUser.user) {
                setPageState(PageState.Successful);
            }
        }
    }, [usersState.createUser]);

    return {
        email,
        setEmail,
        name,
        setName,
        password,
        setPassword,

        fetching: usersState.createUser.fetching,
        disabled,

        emailValid,
        nameValid,
        passwordValid,

        onSubmit,
        onGoToLoginClick
    };
};
