import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useLoadReducers } from "../../hooks/useLoadReducers";
import { UsersContext } from "../../reducer/users/context";
import { Page } from "../page/page";
import { Spin } from "../animate/spin";
import { Image } from "../image/image";

export const PrivateRoutes: FC = () => {
    const location = useLocation();
    const [usersState, usersDispatch] = useContext(UsersContext)
    const [isReady, setIsReady] = useState(false)
    const areReducersLoaded = useLoadReducers()

    const checkIfAuthenticated = useCallback(() => {
        if (isReady || !areReducersLoaded) {
            return
        }

        if (usersState.login.data.isAuthenticated) {
            return setIsReady(true)
        }

        if (!usersState.login.data.tokens?.session) {
            return setIsReady(true)
        }

        if (usersState.login.fetching) {
            return
        }

        usersDispatch({ type: 'login', data: usersState.login.data.tokens })
    }, [isReady, areReducersLoaded, usersState])

    useEffect(() => {
        checkIfAuthenticated()
    }, [isReady, areReducersLoaded, usersState])

    if (!areReducersLoaded || !isReady) {
        return (
            <Page centered>
                <Spin>
                    <Image id="gear" />
                </Spin>
            </Page>
        )
    }

    return usersState.login.data.isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace state={{ from: location }} />;
}
