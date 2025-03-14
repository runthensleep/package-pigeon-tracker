
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { usePackages } from '@/contexts/PackageContext';
import PackageList from './PackageList';
import { PackageIcon, MailPlus, RefreshCw, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PackageDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { packages, isLoading, syncWithGmail } = usePackages();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg => 
    pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group packages by status
  const delivered = filteredPackages.filter(pkg => pkg.status === 'delivered');
  const inTransit = filteredPackages.filter(pkg => 
    pkg.status === 'transit' || 
    pkg.status === 'processing'
  );
  const issues = filteredPackages.filter(pkg => pkg.status === 'exception');
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PackageIcon size={28} className="text-primary" />
            <h1 className="text-xl font-bold">Package Pigeon</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 ">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="w-full md:w-1/2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by carrier, tracking number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={syncWithGmail}
              disabled={isLoading}
              className="flex-1 md:flex-none"
            >
              <MailPlus className="mr-2 h-4 w-4" />
              Sync with Gmail
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isLoading}
              className="flex-1 md:flex-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Package Lists */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              All <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{filteredPackages.length}</span>
            </TabsTrigger>
            <TabsTrigger value="inTransit">
              In Transit <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{inTransit.length}</span>
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{delivered.length}</span>
            </TabsTrigger>
            <TabsTrigger value="issues">
              Issues <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{issues.length}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <PackageList packages={filteredPackages} />
          </TabsContent>
          
          <TabsContent value="inTransit" className="mt-0">
            <PackageList packages={inTransit} />
          </TabsContent>
          
          <TabsContent value="delivered" className="mt-0">
            <PackageList packages={delivered} />
          </TabsContent>
          
          <TabsContent value="issues" className="mt-0">
            <PackageList packages={issues} />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Package Pigeon Tracker &copy; {new Date().getFullYear()}</p>
          <p className="text-xs mt-1">Demo Mode: No actual Gmail connection in this demo.</p>
        </div>
      </footer>
    </div>
  );
};

export default PackageDashboard;
