
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for existing session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('package_tracker_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mock Google sign-in
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would initiate the OAuth flow
      // For now, simulate a successful login with mock data
      const mockUser: User = {
        id: 'user123',
        name: 'Demo User',
        email: 'user@example.com',
        imageUrl: 'https://ui-avatars.com/api/?name=Demo+User',
        accessToken: 'mock-token-' + Math.random().toString(36).substring(2)
      };
      
      // Save to local storage
      localStorage.setItem('package_tracker_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast({
        title: "Successfully signed in",
        description: "Welcome to Package Pigeon!",
      });
    } catch (err) {
      console.error('Sign in failed:', err);
      setError('Authentication failed. Please try again.');
      
      toast({
        title: "Authentication failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('package_tracker_user');
    setUser(null);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const value = {
    user,
    isLoading,
    error,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
