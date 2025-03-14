
import { Package, PackageStatus, GmailEmailData, PackageEvent, Carrier } from '@/types/package';

// Common carriers
export const carriers: Record<string, Carrier> = {
  'ups': { id: 'ups', name: 'UPS', logo: '📦' },
  'fedex': { id: 'fedex', name: 'FedEx', logo: '🚚' },
  'usps': { id: 'usps', name: 'USPS', logo: '📬' },
  'amazon': { id: 'amazon', name: 'Amazon', logo: '📦' },
  'dhl': { id: 'dhl', name: 'DHL', logo: '🌐' },
};

// Helper to generate a random ID
export const generateId = () => Math.random().toString(36).substring(2, 15);

// Format a date string
export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Determine which carrier based on tracking number format
export const detectCarrier = (trackingNumber: string): Carrier => {
  const normalizedTrackingNumber = trackingNumber.replace(/\s+/g, '');
  
  if (/^1Z[0-9A-Z]{16}$/.test(normalizedTrackingNumber)) {
    return carriers.ups;
  } else if (/^[0-9]{12}$/.test(normalizedTrackingNumber)) {
    return carriers.fedex;
  } else if (/^9[0-9]{15,21}$/.test(normalizedTrackingNumber)) {
    return carriers.usps;
  } else if (/^TBA[0-9]{9,12}$/.test(normalizedTrackingNumber)) {
    return carriers.amazon;
  } else if (/^[0-9]{10}$/.test(normalizedTrackingNumber)) {
    return carriers.dhl;
  }
  
  // Default if unknown
  return { id: 'unknown', name: 'Unknown Carrier' };
};

// Parse emails for package tracking information
export const parseEmailsForPackages = (emails: GmailEmailData[]): Package[] => {
  const packages: Package[] = [];
  
  // Regex patterns for tracking numbers
  const patterns = {
    ups: /\b(1Z[0-9A-Z]{16})\b/,
    fedex: /\b([0-9]{12})\b/,
    usps: /\b(9[0-9]{15,21})\b/,
    amazon: /\b(TBA[0-9]{9,12})\b/,
    generic: /tracking\s+(?:number|#|no|code)[:.\s]*\s*([A-Z0-9]{8,30})\b/i
  };
  
  emails.forEach(email => {
    // Combine subject and snippet for searching
    const content = `${email.subject} ${email.snippet}`;
    
    // Try to extract tracking numbers using patterns
    let trackingNumber: string | null = null;
    let matchedCarrier: Carrier = { id: 'unknown', name: 'Unknown Carrier' };
    
    // Check for specific carriers first
    for (const [carrierId, pattern] of Object.entries(patterns)) {
      if (carrierId === 'generic') continue; // Skip generic pattern for now
      
      const match = content.match(pattern);
      if (match && match[1]) {
        trackingNumber = match[1];
        matchedCarrier = carriers[carrierId] || matchedCarrier;
        break;
      }
    }
    
    // If no match found, try generic pattern
    if (!trackingNumber) {
      const genericMatch = content.match(patterns.generic);
      if (genericMatch && genericMatch[1]) {
        trackingNumber = genericMatch[1];
        matchedCarrier = detectCarrier(trackingNumber);
      }
    }
    
    // If we found a tracking number, create a package
    if (trackingNumber) {
      // Check sender domain to help identify carrier
      const senderDomain = email.from.toLowerCase();
      if (senderDomain.includes('amazon')) {
        matchedCarrier = carriers.amazon;
      } else if (senderDomain.includes('fedex')) {
        matchedCarrier = carriers.fedex;
      } else if (senderDomain.includes('ups')) {
        matchedCarrier = carriers.ups;
      } else if (senderDomain.includes('usps')) {
        matchedCarrier = carriers.usps;
      } else if (senderDomain.includes('dhl')) {
        matchedCarrier = carriers.dhl;
      }
      
      // Set appropriate status based on email content
      let status: PackageStatus = 'processing';
      if (content.match(/delivered|completed|arrival/i)) {
        status = 'delivered';
      } else if (content.match(/shipped|transit|out for delivery/i)) {
        status = 'transit';
      } else if (content.match(/delay|exception|problem|failed/i)) {
        status = 'exception';
      }
      
      // Create initial event
      const initialEvent: PackageEvent = {
        id: generateId(),
        timestamp: email.date,
        location: 'Unknown',
        description: email.subject,
        status
      };
      
      // Calculate estimated delivery (mock: 3-5 days from email date)
      const emailDate = new Date(email.date);
      const deliveryDate = new Date(emailDate);
      deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 3);
      
      // Create package object
      const newPackage: Package = {
        id: generateId(),
        trackingNumber,
        carrier: matchedCarrier,
        description: `Order from ${matchedCarrier.name}`,
        status,
        estimatedDelivery: deliveryDate.toISOString(),
        events: [initialEvent],
        lastUpdated: email.date,
        orderDate: email.date,
        emailThreadId: email.threadId
      };
      
      packages.push(newPackage);
    }
  });
  
  return packages;
};

// Mock data for initial state
export const mockPackages: Package[] = [
  {
    id: '1',
    trackingNumber: '1Z999AA10123456784',
    carrier: carriers.ups,
    description: 'New headphones from Amazon',
    status: 'transit',
    estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    lastUpdated: new Date().toISOString(),
    orderDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    events: [
      {
        id: 'evt1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: 'Phoenix, AZ',
        description: 'Shipment picked up',
        status: 'processing'
      },
      {
        id: 'evt2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        location: 'Denver, CO',
        description: 'In transit',
        status: 'transit'
      }
    ]
  },
  {
    id: '2',
    trackingNumber: '9400123456789012345678',
    carrier: carriers.usps,
    description: 'Birthday gift',
    status: 'delivered',
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    orderDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    events: [
      {
        id: 'evt3',
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
        location: 'New York, NY',
        description: 'Shipment picked up',
        status: 'processing'
      },
      {
        id: 'evt4',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: 'Philadelphia, PA',
        description: 'In transit',
        status: 'transit'
      },
      {
        id: 'evt5',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        location: 'Boston, MA',
        description: 'Package delivered',
        status: 'delivered'
      }
    ]
  },
  {
    id: '3',
    trackingNumber: 'TBA123456789012',
    carrier: carriers.amazon,
    description: 'Kitchen appliance',
    status: 'exception',
    estimatedDelivery: new Date(Date.now() + 86400000 * 1).toISOString(),
    lastUpdated: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    orderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    events: [
      {
        id: 'evt6',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: 'Seattle, WA',
        description: 'Shipment picked up',
        status: 'processing'
      },
      {
        id: 'evt7',
        timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        location: 'Portland, OR',
        description: 'Delivery delayed due to weather',
        status: 'exception'
      }
    ]
  }
];

// Get status text and color
export const getStatusInfo = (status: PackageStatus) => {
  switch (status) {
    case 'delivered':
      return { text: 'Delivered', color: 'status-delivered' };
    case 'transit':
      return { text: 'In Transit', color: 'status-transit' };
    case 'processing':
      return { text: 'Processing', color: 'status-processing' };
    case 'exception':
      return { text: 'Exception', color: 'status-exception' };
    case 'pending':
      return { text: 'Pending', color: 'status-pending' };
    default:
      return { text: 'Unknown', color: 'status-pending' };
  }
};
