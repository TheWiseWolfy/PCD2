import React, { useContext } from 'react';
import './App.css';
import { useWebSockets } from './hooks/useWebSockets';
import { UsersContextProvider } from './reducer/users/context'
import { ProjectsContextProvider } from './reducer/projects/context';
import { VisualisationsContextProvider } from './reducer/visualisations/context';
import { DataContextProvider } from './reducer/data/context';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';

export const App = () => {
  const websocket = useWebSockets('wss://ihdi383qof.execute-api.eu-central-1.amazonaws.com/Production')

  return (
    <UsersContextProvider websocket={websocket}>
      <ProjectsContextProvider websocket={websocket}>
        <VisualisationsContextProvider websocket={websocket}>
          <DataContextProvider websocket={websocket}>
            <RouterProvider router={router} />
          </DataContextProvider>
        </VisualisationsContextProvider>
      </ProjectsContextProvider>
    </UsersContextProvider>
  );
}