import { createBrowserRouter } from "react-router-dom";
import { Root } from '../pages/root/root'
import { Login } from "../pages/login/login";
import { Register } from "../pages/register/register";
import { App } from "../pages/app/app";
import { Statistics } from "../pages/statistics/statistics";
import { Projects } from "../pages/projects/projects";
import { CreateProject } from "../pages/createProject/createProject";

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
        path: '/register',
        element: <Register />
    },
    {
        path: '/app',
        element: <App />
    },
    {
        path: '/app/projects',
        element: <Projects />
    },
    {
        path: '/app/projects/create',
        element: <CreateProject />
    },
    {
        path: '/app/projects/:projectId/visualisations/statistics',
        element: <Statistics />
    }
])

