
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePackages } from '@/contexts/PackageContext';
import { formatDate, getStatusInfo } from '@/utils/packageUtils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Package as PackageIcon, Clock, MapPin } from 'lucide-react';

const PackageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPackageById } = usePackages();
  const navigate = useNavigate();
  
  const pkg = getPackageById(id || '');
  
  if (!pkg) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Package Not Found</h2>
        <p className="mb-4">The package you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(pkg.status);
  const events = [...pkg.events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Top navigation */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      {/* Package header card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{pkg.description}</CardTitle>
              <CardDescription>
                {pkg.carrier.logo && <span className="mr-1">{pkg.carrier.logo}</span>}
                {pkg.carrier.name} • Tracking #: <span className="font-mono">{pkg.trackingNumber}</span>
              </CardDescription>
            </div>
            <div className={`flex items-center px-3 py-1 rounded-full text-status-${pkg.status} bg-status-${pkg.status}/10`}>
              <span className={`package-status-indicator status-${pkg.status}`}></span>
              {statusInfo.text}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Order Date</span>
              <span className="font-medium">{formatDate(pkg.orderDate)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Last Updated</span>
              <span className="font-medium">{formatDate(pkg.lastUpdated)}</span>
            </div>
            {pkg.estimatedDelivery && (
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">Estimated Delivery</span>
                <span className="font-medium">{formatDate(pkg.estimatedDelivery)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://www.google.com/search?q=${pkg.carrier.name}+tracking+${pkg.trackingNumber}`, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Track on {pkg.carrier.name} Website
            </Button>
            {pkg.emailThreadId && (
              <Button 
                variant="outline" 
                onClick={() => window.open(`https://mail.google.com/mail/u/0/#search/rfc822msgid:${pkg.emailThreadId}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Original Email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Package timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tracking History</CardTitle>
          <CardDescription>
            Latest events for your package are shown first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {events.length > 0 ? (
              events.map((event, index) => {
                const statusInfo = getStatusInfo(event.status);
                return (
                  <div key={event.id} className="relative pl-8">
                    {/* Timeline line */}
                    {index < events.length - 1 && (
                      <div className="absolute left-3 top-5 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    
                    {/* Status indicator */}
                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center bg-status-${event.status}/20 border-2 border-status-${event.status}`}>
                      <span className={`h-2 w-2 rounded-full bg-status-${event.status}`}></span>
                    </div>
                    
                    <div className="mb-1">
                      <span className="font-medium">{event.description}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full text-status-${event.status} bg-status-${event.status}/10`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 items-center">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(event.timestamp)} 
                        {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {event.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <PackageIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No tracking events available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageDetail;
