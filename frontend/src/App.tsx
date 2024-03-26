import React, { useContext } from 'react';
import './App.css';
import { useWebSockets } from './hooks/useWebSockets';
import { AuthContextProvider } from './reducer/auth/context'
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';

export const App = () => {
  const websocket = useWebSockets('wss://qyf60arjr8.execute-api.eu-central-1.amazonaws.com/Production')

  return (
    <AuthContextProvider websocket={websocket}>
      <RouterProvider router={router} />
    </AuthContextProvider>
  );
}