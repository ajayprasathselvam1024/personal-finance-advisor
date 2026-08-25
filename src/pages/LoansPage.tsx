import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, X } from 'lucide-react';
import type { Loan, LoanType } from '../types';
import { dataService } from '../services/dataService';
import { calculateEMI } from '../utils/calculations';
import { formatINR } from '../utils/formatters';

interface LoansPageProps {
  loans: Loan[];
  monthlyIncome?: number;
  onRefresh: () => void;
}

const LOAN_TYPES: LoanType[] = [
  'Personal Loan',
  'Home Loan',
  'Vehicle Loan',
  'Credit Card',
  'Consumer Loan',
  'Other',
];

export const LoansPage: React.FC<LoansPageProps> = ({
  loans,
  monthlyIncome = 91000,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<LoanType>('Personal Loan');
  const [originalAmount, setOriginalAmount] = useState('');
  const [currentOutstanding, setCurrentOutstanding] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [interestRate, setInterestRate] = useState('12.0');
  const [tenureMonths, setTenureMonths] = useState('24');
  const [remainingTenure, setRemainingTenure] = useState('18');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDateDay, setDueDateDay] = useState('5');
  const [lender, setLender] = useState('');
  const [notes, setNotes] = useState('');

  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.current_outstanding, 0);
  const totalMonthlyEmi = activeLoans.reduce((sum, l) => sum + l.emi_amount, 0);
  const emiBurdenPercent = monthlyIncome > 0 ? Math.round((totalMonthlyEmi / monthlyIncome) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingLoan(null);
    setName('');
    setType('Personal Loan');
    setOriginalAmount('');
    setCurrentOutstanding('');
    setEmiAmount('');
    setInterestRate('12.0');
    setTenureMonths('24');
    setRemainingTenure('18');
    setLender('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: Loan) => {
    setEditingLoan(l);
    setName(l.name);
    setType(l.type);
    setOriginalAmount(l.original_amount.toString());
    setCurrentOutstanding(l.current_outstanding.toString());
    setEmiAmount(l.emi_amount.toString());
    setInterestRate(l.interest_rate.toString());
    setTenureMonths(l.tenure_months.toString());
    setRemainingTenure(l.remaining_tenure.toString());
    setStartDate(l.start_date);
    setDueDateDay(l.due_date_day.toString());
    setLender(l.lender);
    setNotes(l.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan record?')) {
      await dataService.deleteLoan(id);
      onRefresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const origAmt = parseFloat(originalAmount);
    const currOut = parseFloat(currentOutstanding);
    const rate = parseFloat(interestRate);
    const tenure = parseInt(tenureMonths, 10);

    let calculatedEmi = parseFloat(emiAmount);
    if (!calculatedEmi || calculatedEmi <= 0) {
      calculatedEmi = calculateEMI(currOut > 0 ? currOut : origAmt, rate, tenure);
    }

    if (editingLoan) {
      await dataService.updateLoan(editingLoan.id, {
        name,
        type,
        original_amount: origAmt,
        current_outstanding: currOut,
        emi_amount: calculatedEmi,
        interest_rate: rate,
        tenure_months: tenure,
        remaining_tenure: parseInt(remainingTenure, 10),
        start_date: startDate,
        due_date_day: parseInt(dueDateDay, 10),
        lender,
        notes,
      });
    } else {
      await dataService.addLoan({
        name,
        type,
        original_amount: origAmt,
        current_outstanding: currOut,
        emi_amount: calculatedEmi,
        interest_rate: rate,
        tenure_months: tenure,
        remaining_tenure: parseInt(remainingTenure, 10),
        start_date: startDate,
        due_date_day: parseInt(dueDateDay, 10),
        lender: lender || 'Bank / Lender',
        status: 'active',
        notes,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Loans & EMI Management
          </h1>
          <p className="text-xs text-slate-500">Track all active loans, monthly EMI burdens, interest rates & pay-off dates</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Loan</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Outstanding Principal</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalOutstanding)}</p>
          <p className="mt-1 text-xs text-indigo-600">{activeLoans.length} active loan accounts</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monthly EMI</span>
          <p className="mt-2 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatINR(totalMonthlyEmi)}</p>
          <p className="mt-1 text-xs text-slate-500">Auto-calculated sum</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">EMI Burden Ratio</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{emiBurdenPercent}%</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {emiBurdenPercent > 35 ? '⚠️ High (>35% limit)' : '✅ Healthy (<35% limit)'}
          </p>
        </div>
      </div>

      {/* Loan Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {loan.type}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{loan.name}</h3>
                  <p className="text-xs text-slate-400">{loan.lender}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(loan)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(loan.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Outstanding</p>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatINR(loan.current_outstanding)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Monthly EMI</p>
                  <p className="font-extrabold text-indigo-600 dark:text-indigo-400">{formatINR(loan.emi_amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Interest Rate</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{loan.interest_rate}% p.a.</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">EMIs Remaining</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{loan.remaining_tenure} months</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Due: {loan.due_date_day}th monthly
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Total: {formatINR(loan.original_amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingLoan ? 'Edit Loan' : 'Add New Loan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Loan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROAR Personal Loan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Loan Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LoanType)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {LOAN_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Original Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={originalAmount}
                    onChange={(e) => setOriginalAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Current Outstanding (₹)</label>
                  <input
                    type="number"
                    required
                    value={currentOutstanding}
                    onChange={(e) => setCurrentOutstanding(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    placeholder="Auto-calc"
                    value={emiAmount}
                    onChange={(e) => setEmiAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Remaining Months</label>
                  <input
                    type="number"
                    required
                    value={remainingTenure}
                    onChange={(e) => setRemainingTenure(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Lender / Bank</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC, NAVI, RBL"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">EMI Due Day (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
                >
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
