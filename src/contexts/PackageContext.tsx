
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Package, PackageStatus, GmailEmailData } from '@/types/package';
import { useAuth } from './AuthContext';
import { mockPackages, parseEmailsForPackages } from '@/utils/packageUtils';

interface PackageContextType {
  packages: Package[];
  isLoading: boolean;
  error: string | null;
  syncWithGmail: () => Promise<void>;
  getPackageById: (id: string) => Package | undefined;
  refreshPackages: () => void;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const usePackages = () => {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackages must be used within a PackageProvider');
  }
  return context;
};

export const PackageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load packages from localStorage when the component mounts
  useEffect(() => {
    if (user) {
      loadPackages();
    } else {
      setPackages([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadPackages = () => {
    try {
      setIsLoading(true);
      const savedPackages = localStorage.getItem(`packages_${user?.id}`);
      if (savedPackages) {
        setPackages(JSON.parse(savedPackages));
      } else {
        // For demo purposes, initialize with mock data
        setPackages(mockPackages);
        localStorage.setItem(`packages_${user?.id}`, JSON.stringify(mockPackages));
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
      setError('Failed to load packages. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load packages.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithGmail = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to sync with Gmail.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // In a real app, this would fetch emails from Gmail API
      // For demo, we'll simulate finding new packages in emails
      
      // Simulating a delay to mimic API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock email data
      const mockEmails: GmailEmailData[] = [
        {
          id: 'email1',
          threadId: 'thread1',
          subject: 'Your Amazon order has shipped',
          snippet: 'Your package with tracking number 1Z999AA10123456784 has shipped',
          from: 'ship-confirm@amazon.com',
          date: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
          id: 'email2',
          threadId: 'thread2',
          subject: 'FedEx Shipment Notification',
          snippet: 'Tracking # 794657100123',
          from: 'fedexshipment@fedex.com',
          date: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
        }
      ];
      
      // Parse mock emails for package tracking information
      const newPackages = parseEmailsForPackages(mockEmails);
      
      // Combine with existing packages, avoiding duplicates
      const updatedPackages = [...packages];
      newPackages.forEach(newPackage => {
        const existingIndex = updatedPackages.findIndex(p => 
          p.trackingNumber === newPackage.trackingNumber && 
          p.carrier.id === newPackage.carrier.id
        );
        
        if (existingIndex >= 0) {
          // Update existing package
          updatedPackages[existingIndex] = {
            ...updatedPackages[existingIndex],
            ...newPackage,
            events: [...updatedPackages[existingIndex].events, ...newPackage.events]
          };
        } else {
          // Add new package
          updatedPackages.push(newPackage);
        }
      });
      
      // Save and update state
      setPackages(updatedPackages);
      localStorage.setItem(`packages_${user?.id}`, JSON.stringify(updatedPackages));
      
      toast({
        title: "Gmail sync complete",
        description: `Found ${newPackages.length} new packages.`,
      });
    } catch (err) {
      console.error('Gmail sync failed:', err);
      setError('Failed to sync with Gmail. Please try again.');
      toast({
        title: "Sync failed",
        description: "Could not retrieve packages from Gmail.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageById = (id: string) => {
    return packages.find(pkg => pkg.id === id);
  };

  const refreshPackages = () => {
    loadPackages();
  };

  const value = {
    packages,
    isLoading,
    error,
    syncWithGmail,
    getPackageById,
    refreshPackages,
  };

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
};
