export interface Budget {
  id: number;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  userId: number;
}