import React, { useState } from 'react';
import { X, Check, Zap } from 'lucide-react';
import type { PaymentMethod } from '../../types';
import { dataService } from '../../services/dataService';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Food',
  'Groceries',
  'Transport',
  'Shopping',
  'Utilities',
  'Housing',
  'Entertainment',
  'Subscriptions',
  'Medical',
  'Insurance',
  'Education',
  'Personal Care',
  'Family',
  'Travel',
  'Fuel',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await dataService.addExpense({
        amount: numAmount,
        category_name: category,
        merchant: merchant || undefined,
        payment_method: paymentMethod,
        date,
        is_recurring: false,
      });

      setAmount('');
      setMerchant('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Add Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Field (Large Input) */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Amount (₹) *
            </label>
            <div className="relative mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-2xl font-extrabold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* Quick Category Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Category
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Payment Method
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  type="button"
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                    paymentMethod === pm
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant / Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Merchant / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy, DMart, Shell Fuel"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
