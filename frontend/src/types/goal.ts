export interface Goal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  userId: number;
}