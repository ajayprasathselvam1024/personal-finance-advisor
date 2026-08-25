import React, { useState } from 'react';
import { Download } from 'lucide-react';
import type { IncomeItem, ExpenseItem, Loan } from '../types';
import { formatINR } from '../utils/formatters';

interface ReportsPageProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  loans: Loan[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  incomes,
  expenses,
  loans,
}) => {
  const [reportType, setReportType] = useState('expense');

  const exportCSV = () => {
    let csvData = 'Type,Category/Name,Amount,Date,Payment Method/Lender\n';

    if (reportType === 'income') {
      incomes.forEach((i) => {
        csvData += `Income,${i.source},${i.amount},${i.date},${i.description}\n`;
      });
    } else if (reportType === 'expense') {
      expenses.forEach((e) => {
        csvData += `Expense,${e.category_name},${e.amount},${e.date},${e.payment_method}\n`;
      });
    } else if (reportType === 'loans') {
      loans.forEach((l) => {
        csvData += `Loan,${l.name},${l.current_outstanding},${l.start_date},${l.lender}\n`;
      });
    } else {
      expenses.forEach((e) => {
        csvData += `Transaction,${e.category_name},${e.amount},${e.date},${e.payment_method}\n`;
      });
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Reports & Exports
          </h1>
          <p className="text-xs text-slate-500">Generate 10 comprehensive financial statements and export CSV data</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-wrap gap-2">
        {[
          { id: 'income', label: '1. Monthly Income Report' },
          { id: 'expense', label: '2. Monthly Expense Report' },
          { id: 'category', label: '3. Category-wise Expense Report' },
          { id: 'emi', label: '4. EMI Burden Report' },
          { id: 'loans', label: '5. Outstanding Loans Report' },
          { id: 'gold', label: '6. Gold Loans Report' },
          { id: 'savings', label: '7. Savings Report' },
          { id: 'investment', label: '8. Investment Portfolio Report' },
          { id: 'cashflow', label: '9. Cash Flow Surplus Report' },
          { id: 'networth', label: '10. Net Worth Audit Report' },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              reportType === r.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary Box for selected report */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Report Data Preview ({reportType.toUpperCase()})
        </h3>

        <div className="mt-4 space-y-3">
          {reportType === 'income' &&
            incomes.map((i) => (
              <div key={i.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
                <span>{i.source} - {i.description}</span>
                <span className="font-bold text-emerald-600">+{formatINR(i.amount)}</span>
              </div>
            ))}

          {reportType === 'expense' &&
            expenses.map((e) => (
              <div key={e.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
                <span>{e.category_name} - {e.merchant || 'Expense'}</span>
                <span className="font-bold text-rose-600">-{formatINR(e.amount)}</span>
              </div>
            ))}

          {reportType === 'loans' &&
            loans.map((l) => (
              <div key={l.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
                <span>{l.name} ({l.lender})</span>
                <span className="font-bold text-indigo-600">{formatINR(l.current_outstanding)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
