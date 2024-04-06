import { FC } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthenticated } from "../../hooks/useAuthenticated";
import { useLoadReducers } from "../../hooks/useLoadReducers";
import { usePrefetch } from "../../hooks/usePrefetch";
import { Spin } from "../animate/spin";
import { Image } from "../image/image";
import { Page } from "../page/page";

export const PrivateRoutes: FC = () => {
    const location = useLocation();
    const areReducersLoaded = useLoadReducers()
    const isAuthenticated = useAuthenticated(areReducersLoaded)
    const isReady = usePrefetch(isAuthenticated || false)

    if (!areReducersLoaded || typeof isAuthenticated !== 'boolean' || (isAuthenticated === true && !isReady)) {
        return (
            <Page centered>
                <Spin>
                    <Image id="gear" />
                </Spin>
            </Page>
        )
    }

    return isAuthenticated
        ? <Outlet />    
        : <Navigate to="/login" replace state={{ from: location }} />;
}
