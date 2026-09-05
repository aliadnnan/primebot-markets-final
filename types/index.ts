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
  accountNumber: string;
  accountType: string;
  instructions: string;
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
