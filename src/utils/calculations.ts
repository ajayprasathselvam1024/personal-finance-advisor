import type { IncomeItem, ExpenseItem, FinancialSummary } from '../types';

export const calculateFinancialSummary = (
  incomes: IncomeItem[],
  expenses: ExpenseItem[]
): FinancialSummary => {
  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthIncomes = incomes.filter((item) => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthExpenses = expenses.filter((item) => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthIncome = currentMonthIncomes.reduce((sum, item) => sum + (item.amount || 0), 0);
  const currentMonthExpense = currentMonthExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const currentMonthBalance = currentMonthIncome - currentMonthExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthBalance,
  };
};
