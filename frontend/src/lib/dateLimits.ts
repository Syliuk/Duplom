export const MIN_TRANSACTION_DATE = "2000-01-01";
export const MIN_HISTORICAL_DATE = "2000-01-01";
export const MAX_PLANNING_DATE = "2100-12-31";

export const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isDateInRange = (date: string, min: string, max: string) => (
  date >= min && date <= max
);
