import type { Transaction } from '../types/transaction';
import type { Budget } from '../types/budget';
import type { Goal } from '../types/goal';
import type { Debt } from '../types/debt';
import type { RecurringTransaction } from '../types/recurring';

const quoteCsv = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
};

const formatDateForCsv = (value: string): string => {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportJsonData = (data: unknown, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, filename, 'application/json');
};

export const exportDataToCSV = (
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  debts: Debt[],
  recurring: RecurringTransaction[],
  filename: string,
) => {
  const transactionRows = transactions.map((transaction) => [
    transaction.id,
    transaction.title,
    transaction.amount,
    transaction.category,
    transaction.type === 'income' ? 'Доход' : 'Витрата',
    formatDateForCsv(transaction.date),
    transaction.note ?? '',
  ]);

  const budgetRows = budgets.map((budget) => [
    budget.id,
    budget.category,
    budget.amount,
    budget.period === 'monthly' ? 'Щомісяця' : 'Щорічно',
  ]);

  const goalRows = goals.map((goal) => [
    goal.id,
    goal.title,
    goal.targetAmount,
    goal.currentAmount,
    formatDateForCsv(goal.deadline),
    goal.category,
  ]);

  const debtRows = debts.map((debt) => [
    debt.id,
    debt.title,
    debt.amount,
    debt.currentAmount,
    debt.amount - debt.currentAmount,
    debt.type === 'borrow' ? 'Я винен' : 'Мені винні',
    debt.person,
    formatDateForCsv(debt.dueDate),
    debt.note ?? '',
  ]);

  const recurringRows = recurring.map((item) => [
    item.id,
    item.title,
    item.amount,
    item.type === 'income' ? 'Дохід' : 'Витрата',
    item.category,
    item.frequency === 'monthly' ? 'Щомісяця' : item.frequency === 'weekly' ? 'Щотижня' : 'Щорічно',
    formatDateForCsv(item.startDate),
    formatDateForCsv(item.nextDate),
    item.isActive ? 'Активний' : 'Неактивний',
    item.note ?? '',
  ]);

  const section = (title: string, headers: string[], rows: unknown[][]) => {
    const headerRow = headers.map(quoteCsv).join(',');
    const rowsCsv = rows.map((row) => row.map(quoteCsv).join(',')).join('\n');
    return [quoteCsv(title), headerRow, rowsCsv].join('\n');
  };

  const csvContent = [
    section(
      'Транзакції',
      ['ID', 'Назва', 'Сума', 'Категорія', 'Тип', 'Дата', 'Нотатка'],
      transactionRows,
    ),
    section(
      'Бюджети',
      ['ID', 'Категорія', 'Сума', 'Період'],
      budgetRows,
    ),
    section(
      'Цілі',
      ['ID', 'Назва', 'Цільова сума', 'Зібрано', 'Дедлайн', 'Категорія'],
      goalRows,
    ),
    section(
      'Борги',
      ['ID', 'Назва', 'Сума', 'Сплачено', 'Залишок', 'Тип', 'Особа', 'Дата повернення', 'Нотатка'],
      debtRows,
    ),
    section(
      'Регулярні платежі',
      ['ID', 'Назва', 'Сума', 'Тип', 'Категорія', 'Частота', 'Дата початку', 'Наступний платіж', 'Статус', 'Нотатка'],
      recurringRows,
    ),
  ].join('\n\n');

  downloadFile('\uFEFF' + csvContent, filename, 'text/csv;charset=utf-8;');
};
