export interface RecurringTransaction {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  frequency: "monthly" | "weekly" | "yearly";
  startDate: string;
  nextDate: string;
  isActive: boolean;
  note?: string;
}