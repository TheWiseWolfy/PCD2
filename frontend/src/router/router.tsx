import { createBrowserRouter } from "react-router-dom";
import { Root } from '../pages/root/root'
import { Login } from "../pages/login/login";
import { App } from "../pages/app/app";
import { Statistics } from "../pages/statistics/statistics";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/app',
        element: <App />
    },
    {
        path: '/statistics',
        element: <Statistics />
    }
])

