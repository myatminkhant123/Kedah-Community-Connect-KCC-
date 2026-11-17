import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './app/providers/AuthProvider.js';
import { LanguageProvider } from './app/providers/LanguageProvider.js';
import { AppRouter } from './app/router/AppRouter.js';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
