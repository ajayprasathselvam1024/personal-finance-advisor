import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import type { InvestmentItem, InvestmentType } from '../types';
import { dataService } from '../services/dataService';
import { formatINR, formatPercent } from '../utils/formatters';

interface InvestmentsPageProps {
  investments: InvestmentItem[];
  onRefresh: () => void;
}

const INVESTMENT_TYPES: InvestmentType[] = [
  'Mutual Funds',
  'SIP',
  'Stocks',
  'FD',
  'RD',
  'Gold',
  'Other',
];

export const InvestmentsPage: React.FC<InvestmentsPageProps> = ({ investments, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvestmentItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('Mutual Funds');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [expectedReturnRate, setExpectedReturnRate] = useState('12.0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalInvested = investments.reduce((sum, i) => sum + i.invested_amount, 0);
  const totalCurrentValue = investments.reduce((sum, i) => sum + i.current_value, 0);
  const totalMonthlySIP = investments.reduce((sum, i) => sum + (i.monthly_contribution || 0), 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const overallReturnPercent = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setType('Mutual Funds');
    setInvestedAmount('');
    setCurrentValue('');
    setMonthlyContribution('5000');
    setExpectedReturnRate('12.0');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InvestmentItem) => {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setInvestedAmount(item.invested_amount.toString());
    setCurrentValue(item.current_value.toString());
    setMonthlyContribution((item.monthly_contribution || 0).toString());
    setExpectedReturnRate(item.expected_return_rate.toString());
    setDate(item.date);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this investment asset record?')) {
      await dataService.deleteInvestment(id);
      onRefresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invAmt = parseFloat(investedAmount);
    const currVal = parseFloat(currentValue) || invAmt;

    if (editingItem) {
      await dataService.updateInvestment(editingItem.id, {
        name,
        type,
        invested_amount: invAmt,
        current_value: currVal,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        expected_return_rate: parseFloat(expectedReturnRate) || 0,
        date,
      });
    } else {
      await dataService.addInvestment({
        name,
        type,
        invested_amount: invAmt,
        current_value: currVal,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        expected_return_rate: parseFloat(expectedReturnRate) || 0,
        date,
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
            Investment Portfolio
          </h1>
          <p className="text-xs text-slate-500">Track mutual funds, equity SIPs, stocks, digital gold & return performance</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Investment Asset</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Capital Invested</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalInvested)}</p>
          <p className="mt-1 text-xs text-slate-500">{investments.length} active assets</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Portfolio Value</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(totalCurrentValue)}</p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">
            {totalProfitLoss >= 0 ? `+${formatINR(totalProfitLoss)} (+${formatPercent(overallReturnPercent)})` : `${formatINR(totalProfitLoss)}`}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Profit / Loss</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalProfitLoss >= 0 ? `+${formatINR(totalProfitLoss)}` : formatINR(totalProfitLoss)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Unrealized gains</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly SIP Outflow</span>
          <p className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">{formatINR(totalMonthlySIP)}</p>
          <p className="mt-1 text-xs text-slate-500">Automated systematic investment</p>
        </div>
      </div>

      {/* Investment List Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {investments.map((inv) => {
          const gain = inv.current_value - inv.invested_amount;
          const returnPercent = inv.invested_amount > 0 ? (gain / inv.invested_amount) * 100 : 0;
          return (
            <div
              key={inv.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {inv.type}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{inv.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(inv)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Invested Capital</p>
                    <p className="font-extrabold text-slate-900 dark:text-white">{formatINR(inv.invested_amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Current Value</p>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(inv.current_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Gain / Loss</p>
                    <p className={`font-bold ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {gain >= 0 ? `+${formatINR(gain)}` : formatINR(gain)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Return %</p>
                    <p className={`font-bold ${returnPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {returnPercent >= 0 ? `+${formatPercent(returnPercent)}` : formatPercent(returnPercent)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>SIP: {formatINR(inv.monthly_contribution)}/mo</span>
                <span>Expected: {inv.expected_return_rate}% p.a.</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Investment' : 'Add Investment Asset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Asset / Fund Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nifty 50 Index Mutual Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Investment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as InvestmentType)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {INVESTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Total Invested (₹)</label>
                  <input
                    type="number"
                    required
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Current Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Monthly Contribution (₹)</label>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Expected Annual Return (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedReturnRate}
                    onChange={(e) => setExpectedReturnRate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="w-1/2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
