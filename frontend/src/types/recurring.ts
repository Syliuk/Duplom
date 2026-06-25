export interface RecurringTransaction {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  frequency: string;
  startDate: string;
  nextDate: string;
  isActive: boolean;
  note?: string;
}
