import type { TransactionType } from "../lib/transactionCategories";

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  userId: number;
}
