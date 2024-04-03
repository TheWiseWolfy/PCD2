import { createBrowserRouter } from "react-router-dom";
import { Login } from "../pages/login/login";
import { Register } from "../pages/register/register";
import { Projects } from "../pages/projects/projects";
import { CreateProject } from "../pages/createProject/createProject";
import { PrivateRoutes } from "../components/router/privateRoutes";
import { App } from "../pages/app/app";
import { Visualisations } from "../pages/visualisations/visualisations";
import { CreateVisualisation } from "../pages/createVisualisation/createVisualisation";

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
                path: '/app/projects/:projectId/visualisations',
                element: <Visualisations />
            },
            {
                path: '/app/projects/:projectId/visualisations/create',
                element: <CreateVisualisation />
            }
        ]
    }
])

