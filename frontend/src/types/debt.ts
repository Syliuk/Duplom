export interface Debt {
  id: number;
  title: string;
  amount: number;
  currentAmount: number;
  type: 'borrow' | 'lend';
  person: string;
  dueDate: string;
  note?: string;
  userId: number;
}