
import React from 'react';
import { Package } from '@/types/package';
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getStatusInfo } from '@/utils/packageUtils';
import { Button } from "@/components/ui/button";
import { ChevronRight, Truck, Package as PackageIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PackageListProps {
  packages: Package[];
}

const PackageList: React.FC<PackageListProps> = ({ packages }) => {
  const navigate = useNavigate();
  
  if (packages.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No packages match your current filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {packages.map((pkg) => {
        const statusInfo = getStatusInfo(pkg.status);
        
        // Select the appropriate icon based on package status
        let StatusIcon = Truck;
        if (pkg.status === 'delivered') {
          StatusIcon = CheckCircle;
        } else if (pkg.status === 'exception') {
          StatusIcon = AlertTriangle;
        } else if (pkg.status === 'processing' || pkg.status === 'pending') {
          StatusIcon = PackageIcon;
        }
        
        return (
          <Card 
            key={pkg.id} 
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              {/* Status indicator strip */}
              <div className={`h-2 w-full bg-status-${pkg.status}`}></div>
              
              <div className="p-4">
                {/* Header with carrier and status */}
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-sm text-gray-500">
                    {pkg.carrier.logo && <span className="mr-1">{pkg.carrier.logo}</span>}
                    {pkg.carrier.name}
                  </div>
                  <div className={`flex items-center text-sm font-medium text-status-${pkg.status}`}>
                    <span className={`package-status-indicator status-${pkg.status}`}></span>
                    {statusInfo.text}
                  </div>
                </div>
                
                {/* Package description */}
                <h3 className="font-semibold text-lg mb-2 truncate" title={pkg.description}>
                  {pkg.description}
                </h3>
                
                {/* Tracking info */}
                <div className="text-sm mb-3">
                  <div className="text-gray-600 mb-1">
                    Tracking #: <span className="font-mono">{pkg.trackingNumber}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-500">
                    <span>Order Date: {formatDate(pkg.orderDate)}</span>
                    {pkg.estimatedDelivery && (
                      <span>
                        Est. Delivery: {formatDate(pkg.estimatedDelivery)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Latest update */}
                <div className="bg-gray-50 p-3 rounded-md mb-3 flex items-start">
                  <StatusIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">
                      {pkg.events[pkg.events.length - 1]?.description || 'Status update'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(pkg.lastUpdated)} • {pkg.events[pkg.events.length - 1]?.location || 'Unknown location'}
                    </div>
                  </div>
                </div>
                
                {/* Action button */}
                <Button 
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate(`/package/${pkg.id}`)}
                >
                  Track Package
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PackageList;
