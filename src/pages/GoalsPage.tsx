import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import type { FinancialGoal } from '../types';
import { dataService } from '../services/dataService';
import { formatINR, formatDate } from '../utils/formatters';

interface GoalsPageProps {
  goals: FinancialGoal[];
  onRefresh: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialGoal | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('2027-12-31');
    setMonthlyContribution('5000');
    setPriority('medium');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: FinancialGoal) => {
    setEditingItem(goal);
    setName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setCurrentAmount(goal.current_amount.toString());
    setTargetDate(goal.target_date);
    setMonthlyContribution(goal.monthly_contribution.toString());
    setPriority(goal.priority);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this financial goal?')) {
      await dataService.deleteGoal(id);
      onRefresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount) || 0;

    if (editingItem) {
      await dataService.updateGoal(editingItem.id, {
        name,
        target_amount: target,
        current_amount: curr,
        target_date: targetDate,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        priority,
      });
    } else {
      await dataService.addGoal({
        name,
        target_amount: target,
        current_amount: curr,
        target_date: targetDate,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        priority,
        category: 'General',
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
            Financial Goals
          </h1>
          <p className="text-xs text-slate-500">Track target savings milestones, completion timelines & required contributions</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals List Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);
          
          // Months remaining until target date
          const targetD = new Date(goal.target_date);
          const nowD = new Date();
          const monthsLeft = Math.max(1, Math.ceil((targetD.getTime() - nowD.getTime()) / (1000 * 60 * 60 * 24 * 30)));
          const requiredMonthly = Math.round(remaining / monthsLeft);
          const isOnTrack = goal.monthly_contribution >= requiredMonthly || progress >= 100;

          return (
            <div
              key={goal.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Priority: {goal.priority.toUpperCase()}
                      </span>
                      {isOnTrack ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          ON TRACK
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          NEEDS ATTENTION
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Progress: {formatINR(goal.current_amount)}</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{progress}%</span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Remaining: {formatINR(remaining)}</span>
                    <span>Target: {formatINR(goal.target_amount)}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Target Date</p>
                    <p className="font-bold text-slate-900 dark:text-white">{formatDate(goal.target_date)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Required Monthly</p>
                    <p className="font-extrabold text-blue-600 dark:text-blue-400">{formatINR(requiredMonthly)}/mo</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Financial Goal' : 'Create Financial Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy New Car, Clear Debt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Already Saved (₹)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Target Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
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
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
