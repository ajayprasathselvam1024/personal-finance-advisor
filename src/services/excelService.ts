import * as XLSX from 'xlsx';
import type { UnifiedTransaction, IncomeItem, ExpenseItem } from '../types';

export const exportTransactionsToExcel = (
  transactions: UnifiedTransaction[],
  fileNamePrefix: string = 'Financial_Transactions'
) => {
  if (!transactions || transactions.length === 0) {
    alert('No transaction records available to export.');
    return;
  }

  const formatSourceLabel = (src?: string) => {
    if (src === 'IDFC_BANK') return 'IDFC FIRST Bank';
    if (src === 'HDFC_BANK') return 'HDFC Bank';
    if (src === 'GOOGLE_PAY') return 'Google Pay';
    return 'Manual';
  };

  // Format rows for Excel
  const excelRows = transactions.map((t) => ({
    Date: t.date,
    Type: t.type === 'income' ? 'INCOME' : 'EXPENSE',
    Category: t.category_name,
    Description: t.description || '',
    'Payment Method': t.payment_method || (t.type === 'income' ? 'N/A' : 'Other'),
    Source: formatSourceLabel(t.source),
    'Reference ID': t.reference_id || 'N/A',
    'Amount (₹)': t.amount,
    Notes: t.notes || '',
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Type
    { wch: 18 }, // Category
    { wch: 25 }, // Description
    { wch: 15 }, // Payment Method
    { wch: 16 }, // Source
    { wch: 18 }, // Reference ID
    { wch: 14 }, // Amount
    { wch: 25 }, // Notes
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

  // Generate file name with current timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${fileNamePrefix}_${dateStr}.xlsx`;

  // Download .xlsx file
  XLSX.writeFile(workbook, filename);
};

export const exportIncomesToExcel = (incomes: IncomeItem[]) => {
  const unified: UnifiedTransaction[] = incomes.map((i) => ({
    id: i.id,
    type: 'income',
    amount: i.amount,
    date: i.date,
    category_name: i.category_name,
    description: i.description,
    source: i.source,
    reference_id: i.reference_id,
    notes: i.notes,
  }));
  exportTransactionsToExcel(unified, 'Income_Report');
};

export const exportExpensesToExcel = (expenses: ExpenseItem[]) => {
  const unified: UnifiedTransaction[] = expenses.map((e) => ({
    id: e.id,
    type: 'expense',
    amount: e.amount,
    date: e.date,
    category_name: e.category_name,
    description: e.description,
    payment_method: e.payment_method,
    source: e.source,
    reference_id: e.reference_id,
    notes: e.notes,
  }));
  exportTransactionsToExcel(unified, 'Expense_Report');
};
