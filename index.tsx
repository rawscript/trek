import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DeviceProvider } from './context/DeviceContext';
import { FundraiserProvider } from './context/FundraiserContext';
import { NotificationProvider } from './context/NotificationContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ActivityProvider } from './context/ActivityContext';
import ErrorBoundary from './components/layout/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <PreferencesProvider>
          <NotificationProvider>
            <DeviceProvider>
              <ActivityProvider>
                <FundraiserProvider>
                  <App />
                </FundraiserProvider>
              </ActivityProvider>
            </DeviceProvider>
          </NotificationProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);