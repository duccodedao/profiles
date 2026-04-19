export interface Project {
  id?: string;
  title: string;
  description: string;
  image: string;
  refLink: string;
  refCode: string;
  slug: string;
  category: string;
  createdAt: any;
  updatedAt?: any;
  clicks?: number;
  isVerified?: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  invitedBy?: string; // referral code of the person who invited this user
  referralCode: string; // user's own code
  isVerified: boolean; // if the user is verified
  balance: number;
  totalEarned: number;
  referralsCount: number;
  createdAt: any;
  // Bank fields for withdrawal
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankCode?: string; // Used for VietQR (e.g., vcb, tcb...)
  // Banning & Tracking fields
  isBanned?: boolean;
  bannedReason?: string;
  lastIp?: string;
  deviceId?: string;
  phoneNumber?: string;
  countryCode?: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  reward: number;
  steps: string[];
  image?: string;
  status: 'active' | 'inactive';
  createdAt: any;
}

export interface TaskSubmission {
  id?: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  proof: string; // Text or images proof
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  reward: number;
  createdAt: any;
  updatedAt?: any;
}

export interface Withdrawal {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  adminNote?: string;
  createdAt: any;
  processedAt?: any;
}

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'referral' | 'task' | 'withdrawal' | 'commission' | 'bonus' | 'penalty';
  description: string;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface GithubConfig {
  username: string;
  repo: string;
  branch?: string;
  folder?: string;
  accessToken?: string;
}

export interface SocialConfig {
  facebook: string;
  telegram: string;
  zalo: string;
  email: string;
}

export interface PaymentConfig {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  adminWalletAddress: string;
  usdtToVndRate: number;
}

export interface Settings {
  github?: GithubConfig;
  social?: SocialConfig;
  contact?: {
    address: string;
    phone: string;
    description: string;
  };
}
