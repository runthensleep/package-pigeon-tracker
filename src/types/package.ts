
export type PackageStatus = 'delivered' | 'transit' | 'processing' | 'exception' | 'pending';

export interface Carrier {
  id: string;
  name: string;
  logo?: string;
}

export interface PackageEvent {
  id: string;
  timestamp: string;
  location: string;
  description: string;
  status: PackageStatus;
}

export interface Package {
  id: string;
  trackingNumber: string;
  carrier: Carrier;
  description: string;
  status: PackageStatus;
  estimatedDelivery?: string;
  events: PackageEvent[];
  lastUpdated: string;
  orderDate: string;
  emailThreadId?: string;
}

export interface GmailEmailData {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  from: string;
  date: string;
}
