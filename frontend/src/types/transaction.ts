export interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  note?: string;
  userId: number;
}