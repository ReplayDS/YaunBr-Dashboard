import React from 'react';
import { MockBackendProvider, useMockBackend } from './services/MockBackendContext';
import { Auth } from './components/Auth';
import { ClientDashboard } from './components/ClientDashboard';
import { SupplierDashboard } from './components/SupplierDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { UserRole } from './types';

const Main: React.FC = () => {
  const { currentUser } = useMockBackend();

  if (!currentUser) {
    return <Auth />;
  }

  switch (currentUser.role) {
    case UserRole.CLIENT:
      return <ClientDashboard />;
    case UserRole.SUPPLIER:
      return <SupplierDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <Auth />;
  }
};

const App: React.FC = () => {
  return (
    <MockBackendProvider>
      <Main />
    </MockBackendProvider>
  );
};

export default App;