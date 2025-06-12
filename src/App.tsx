import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthContainer from './components/Auth/AuthContainer';
import Dashboard from './components/Dashboard/Dashboard';
import {Toaster}  from "react-hot-toast";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthContainer />;
};

function App() {
  return (
    <AuthProvider>
<Toaster>
      <AppContent />
    </AuthProvider>
  );
}

export default App;