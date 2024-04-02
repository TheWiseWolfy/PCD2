import { createBrowserRouter } from "react-router-dom";
import { Login } from "../pages/login/login";
import { Register } from "../pages/register/register";
import { Statistics } from "../pages/statistics/statistics";
import { Projects } from "../pages/projects/projects";
import { CreateProject } from "../pages/createProject/createProject";
import { PrivateRoutes } from "../components/router/privateRoutes";
import { App } from "../pages/app/app";

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/',
        element: <PrivateRoutes />,
        children: [
            {
                path: '/*',
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
                path: '/app/projects/:projectId/visualisations/:visualisationId/statistics',
                element: <Statistics />
            }
        ]
    }
])

