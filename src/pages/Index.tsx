
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import PackageDashboard from '@/components/PackageDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
          <div className="h-3 w-32 bg-primary/10 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginScreen />;
  }
  
  return <PackageDashboard />;
};

export default Index;
