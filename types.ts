
export interface Transaction {
  id: number;
  name: string;
  category: 'Food' | 'Shopping' | 'Transport' | 'Entertainment' | 'Bills' | 'Income';
  amount: number;
  date: string;
  type: 'credit' | 'debit';
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  progress: number;
  goal: number;
  reward: string;
}

export interface Nudge {
  transaction: Transaction;
  suggestion: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
