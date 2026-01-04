export type ExecutionStatus = 
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'FIAT_RECEIVED'
  | 'CONVERTED'
  | 'SETTLED';

export type FiatCurrency = 'EUR' | 'USD' | 'AED' | 'GBP';

export type UserRole = 'ADMIN' | 'APPROVER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface ExecutionRequest {
  id: string;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  targetAsset: string;
  status: ExecutionStatus;
  initiatorId: string;
  initiatorName: string;
  binanceAccountRef: string;
  coreWalletAddress: string;
  internalReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  requestId: string;
  approverId: string;
  approverName: string;
  decision: 'APPROVED' | 'REJECTED';
  timestamp: string;
  notes?: string;
}

export interface ConversionRecord {
  id: string;
  requestId: string;
  binanceOrderId: string;
  exchangeRate: number;
  tradingFee: number;
  usdtAmount: number;
  executedAt: string;
}

export interface Settlement {
  id: string;
  requestId: string;
  walletAddress: string;
  txHash: string;
  networkFee: number;
  netAmount: number;
  settledAt: string;
}

export interface FeeBreakdown {
  bankFee: number;
  exchangeFee: number;
  withdrawalFee: number;
  gasFee: number;
  netAmount: number;
}

export interface DashboardStats {
  totalExecutions: number;
  pendingApprovals: number;
  totalVolume: number;
  settledToday: number;
}
