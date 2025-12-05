export enum UserRole {
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FINALIZED = 'FINALIZED',
  DISPUTE = 'DISPUTE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
  phone?: string;
  
  // Client specifics
  cpf?: string;
  feePercentage?: number; // Custom fee per client
  
  // Supplier specifics
  supplierId?: string; // The 6-digit code
  alipayQrCodeUrl?: string;
  isApproved?: boolean; // For supplier approval flow
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  supplierId: string; // The user ID of the supplier
  description: string;
  valueYuan: number;
  status: OrderStatus;
  createdAt: string;
  
  // Shipping details
  trackingCode?: string;
  shippingPhotos?: string[]; // Array of base64 or URLs
  
  // Dispute
  disputeReason?: string;
}

export interface Transaction {
  id: string;
  supplierId: string;
  supplierName: string;
  amountYuan: number;
  type: 'WITHDRAWAL' | 'INCOME';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export interface ExchangeRate {
  cnyToBrl: number;
}