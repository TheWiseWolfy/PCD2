import React, { useContext } from 'react';
import './App.css';
import { useWebSockets } from './hooks/useWebSockets';
import { AuthContextProvider } from './reducer/auth/context'
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';

export const App = () => {
  const websocket = useWebSockets('wss://ucj8p60zy7.execute-api.eu-central-1.amazonaws.com/production/')

  return (
    <AuthContextProvider websocket={websocket}>
      <RouterProvider router={router} />
    </AuthContextProvider>
  );
}