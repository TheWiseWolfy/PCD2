import React, { useContext } from 'react';
import './App.css';
import { useWebSockets } from './hooks/useWebSockets';
import { UsersContextProvider } from './reducer/users/context'
import { ProjectsContextProvider } from './reducer/projects/context';
import { DataContextProvider } from './reducer/data/context';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';

export const App = () => {
  const websocket = useWebSockets('wss://qyf60arjr8.execute-api.eu-central-1.amazonaws.com/Production')

  return (
    <UsersContextProvider websocket={websocket}>
      <ProjectsContextProvider websocket={websocket}>
        <DataContextProvider websocket={websocket}>
          <RouterProvider router={router} />
        </DataContextProvider>
      </ProjectsContextProvider>
    </UsersContextProvider>
  );
}