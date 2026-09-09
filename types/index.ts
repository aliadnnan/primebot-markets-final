export interface Bot {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  features: string[];
  image: string;
}

export interface Order {
  id: string;
  fullName: string;
  email: string;
  selectedBot: string;
  paymentMethod: string;
  transactionId: string;
  paymentProof?: string;
  status: 'pending' | 'verified' | 'rejected' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  /** camelCase throughout the UI. Database columns are snake_case and are
   *  normalised by normalisePaymentMethod() in lib/payment-methods.ts. */
  accountNumber: string;
  accountType: string;
  instructions: string;
  /** Name the customer should send the payment to. Optional until configured. */
  accountHolderName?: string;
  /** Public URL or storage path of a QR code image, if the admin uploaded one. */
  qrCodeUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface PerformanceData {
  month: string;
  winRate: number;
  profit: number;
  drawdown: number;
}

export interface BacktestResult {
  name: string;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
}
