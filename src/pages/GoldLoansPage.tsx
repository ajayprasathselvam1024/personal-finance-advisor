import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, X } from 'lucide-react';
import type { GoldLoan } from '../types';
import { dataService } from '../services/dataService';
import { formatINR, formatDate } from '../utils/formatters';

interface GoldLoansPageProps {
  goldLoans: GoldLoan[];
  onRefresh: () => void;
}

export const GoldLoansPage: React.FC<GoldLoansPageProps> = ({ goldLoans, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GoldLoan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [currentOutstanding, setCurrentOutstanding] = useState('');
  const [interestRate, setInterestRate] = useState('10.5');
  const [interestType, setInterestType] = useState<'Monthly Simple' | 'Annual Simple' | 'Compounded' | 'Bullet Payment'>('Monthly Simple');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [lender, setLender] = useState('');
  const [goldPledgedDescription, setGoldPledgedDescription] = useState('');
  const [notes, setNotes] = useState('');

  const activeGoldLoans = goldLoans.filter((g) => g.status === 'active');
  const totalOutstanding = activeGoldLoans.reduce((sum, g) => sum + g.current_outstanding, 0);
  const totalMonthlyInterestPayment = activeGoldLoans.reduce((sum, g) => sum + g.monthly_payment, 0);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setPrincipalAmount('');
    setCurrentOutstanding('');
    setInterestRate('10.5');
    setMonthlyPayment('');
    setLender('');
    setGoldPledgedDescription('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gl: GoldLoan) => {
    setEditingItem(gl);
    setName(gl.name);
    setPrincipalAmount(gl.principal_amount.toString());
    setCurrentOutstanding(gl.current_outstanding.toString());
    setInterestRate(gl.interest_rate.toString());
    setInterestType(gl.interest_type);
    setStartDate(gl.start_date);
    setDueDate(gl.due_date);
    setMonthlyPayment(gl.monthly_payment.toString());
    setLender(gl.lender);
    setGoldPledgedDescription(gl.gold_pledged_description);
    setNotes(gl.notes || '');
    setIsModalOpen(true);
  };

  const handleCloseGoldLoan = async (id: string) => {
    if (confirm('Mark this gold loan as fully paid and CLOSED?')) {
      await dataService.updateGoldLoan(id, { status: 'closed', current_outstanding: 0 });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this gold loan record?')) {
      await dataService.deleteGoldLoan(id);
      onRefresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pAmt = parseFloat(principalAmount);
    const currOut = parseFloat(currentOutstanding);
    const rate = parseFloat(interestRate);

    let mPayment = parseFloat(monthlyPayment);
    if (!mPayment || mPayment <= 0) {
      mPayment = Math.round((currOut * (rate / 100)) / 12);
    }

    if (editingItem) {
      await dataService.updateGoldLoan(editingItem.id, {
        name,
        principal_amount: pAmt,
        current_outstanding: currOut,
        interest_rate: rate,
        interest_type: interestType,
        start_date: startDate,
        due_date: dueDate,
        monthly_payment: mPayment,
        lender,
        gold_pledged_description: goldPledgedDescription,
        notes,
      });
    } else {
      await dataService.addGoldLoan({
        name,
        principal_amount: pAmt,
        current_outstanding: currOut,
        interest_rate: rate,
        interest_type: interestType,
        start_date: startDate,
        due_date: dueDate,
        monthly_payment: mPayment,
        lender: lender || 'Muthoot / Manappuram',
        gold_pledged_description: goldPledgedDescription || 'Pledged Gold Ornaments',
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
            Gold Loan Tracker
          </h1>
          <p className="text-xs text-slate-500">Track pledged gold assets, monthly interest payments, and closure dates</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Gold Loan</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gold Outstanding</span>
          <p className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">{formatINR(totalOutstanding)}</p>
          <p className="mt-1 text-xs text-slate-500">{activeGoldLoans.length} active gold pledges</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Interest Payment</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalMonthlyInterestPayment)}</p>
          <p className="mt-1 text-xs text-amber-600">Calculated simple interest</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pledged Asset Status</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Secure</p>
          <p className="mt-1 text-xs text-slate-500">Regular interest updates active</p>
        </div>
      </div>

      {/* Gold Loans Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
        {goldLoans.map((gl) => (
          <div
            key={gl.id}
            className={`rounded-3xl border p-5 shadow-sm card-hover flex flex-col justify-between ${
              gl.status === 'closed'
                ? 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900'
                : 'border-amber-200/80 bg-white dark:border-amber-900/40 dark:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {gl.interest_type} ({gl.interest_rate}%)
                    </span>
                    {gl.status === 'closed' && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        CLOSED
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{gl.name}</h3>
                  <p className="text-xs text-slate-500">{gl.lender}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(gl)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(gl.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pledged Asset Description */}
              <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-50/50 p-2.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <span className="font-bold">🔑 Pledged Gold: </span>
                {gl.gold_pledged_description}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Outstanding Balance</p>
                  <p className="font-extrabold text-amber-600 dark:text-amber-400">{formatINR(gl.current_outstanding)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Monthly Interest</p>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatINR(gl.monthly_payment)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Principal Loan</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{formatINR(gl.principal_amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Maturity / Due Date</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{formatDate(gl.due_date)}</p>
                </div>
              </div>
            </div>

            {gl.status === 'active' && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleCloseGoldLoan(gl.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-all"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark as Closed</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Gold Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Gold Loan' : 'Add Gold Loan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Gold Loan Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Loan 1 (Bangles)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Pledged Gold Asset Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45 grams 22K Gold Jewellery"
                  value={goldPledgedDescription}
                  onChange={(e) => setGoldPledgedDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Principal Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
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
                  <label className="text-xs font-semibold text-slate-500">Monthly Interest (₹)</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Lender</label>
                  <input
                    type="text"
                    required
                    placeholder="Muthoot / Manappuram"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Due / Maturity Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="w-1/2 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-700"
                >
                  Save Gold Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
