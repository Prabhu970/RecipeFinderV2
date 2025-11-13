import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Toaster } from './components/ui/sonner';

import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <App />
            <Toaster />
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
