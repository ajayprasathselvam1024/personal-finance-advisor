import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, SkipForward, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { seedDemoData } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [income, setIncome] = useState('91000');
  const [rent, setRent] = useState('16000');
  const [food, setFood] = useState('8000');
  const [loanName, setLoanName] = useState('Personal Loan');
  const [loanBalance, setLoanBalance] = useState('450000');
  const [loanEmi, setLoanEmi] = useState('11200');
  const [goldLoanBalance, setGoldLoanBalance] = useState('150000');
  const [goldLoanEmi, setGoldLoanEmi] = useState('1312');
  const [emergencySavings, setEmergencySavings] = useState('75000');
  const [investments, setInvestments] = useState('120000');
  const [goalName, setGoalName] = useState('Emergency Fund Target');
  const [goalAmount, setGoalAmount] = useState('180000');

  const totalSteps = 7;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await saveWizardData();
      onComplete();
    }
  };

  const handleSkipAll = async () => {
    onComplete();
  };

  const handleLoadDemo = async () => {
    await seedDemoData();
    onComplete();
  };

  const saveWizardData = async () => {
    const incNum = parseFloat(income) || 0;
    if (incNum > 0) {
      await dataService.updateProfile({ monthly_income: incNum });
      await dataService.addIncome({
        source: 'Salary',
        amount: incNum,
        date: new Date().toISOString().split('T')[0],
        description: 'Primary Income',
        is_recurring: true,
      });
    }

    const rentNum = parseFloat(rent) || 0;
    if (rentNum > 0) {
      await dataService.addExpense({
        category_name: 'Housing',
        amount: rentNum,
        date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        merchant: 'Rent / Housing',
        is_recurring: true,
      });
    }

    const foodNum = parseFloat(food) || 0;
    if (foodNum > 0) {
      await dataService.addExpense({
        category_name: 'Food',
        amount: foodNum,
        date: new Date().toISOString().split('T')[0],
        payment_method: 'UPI',
        merchant: 'Groceries & Dining',
        is_recurring: false,
      });
    }

    const loanBalNum = parseFloat(loanBalance) || 0;
    const loanEmiNum = parseFloat(loanEmi) || 0;
    if (loanBalNum > 0) {
      await dataService.addLoan({
        name: loanName || 'Personal Loan',
        type: 'Personal Loan',
        original_amount: loanBalNum,
        current_outstanding: loanBalNum,
        emi_amount: loanEmiNum,
        interest_rate: 12.0,
        tenure_months: 48,
        remaining_tenure: 36,
        start_date: new Date().toISOString().split('T')[0],
        due_date_day: 5,
        lender: 'Bank / Lender',
        status: 'active',
      });
    }

    const glBalNum = parseFloat(goldLoanBalance) || 0;
    const glEmiNum = parseFloat(goldLoanEmi) || 0;
    if (glBalNum > 0) {
      await dataService.addGoldLoan({
        name: 'Gold Loan 1',
        principal_amount: glBalNum,
        current_outstanding: glBalNum,
        interest_rate: 10.5,
        interest_type: 'Monthly Simple',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '2027-12-31',
        monthly_payment: glEmiNum,
        lender: 'Gold Lender',
        gold_pledged_description: 'Gold Jewellery Pledged',
        status: 'active',
      });
    }

    const savNum = parseFloat(emergencySavings) || 0;
    if (savNum > 0) {
      await dataService.addSavings({
        name: 'HDFC Bank Emergency Fund',
        type: 'Emergency Fund',
        amount: savNum,
        expected_return_rate: 5.5,
        date: new Date().toISOString().split('T')[0],
      });
    }

    const invNum = parseFloat(investments) || 0;
    if (invNum > 0) {
      await dataService.addInvestment({
        name: 'Nifty 50 Mutual Fund',
        type: 'Mutual Funds',
        invested_amount: invNum,
        current_value: invNum * 1.15,
        monthly_contribution: 5000,
        expected_return_rate: 12.0,
        date: new Date().toISOString().split('T')[0],
      });
    }

    const goalAmtNum = parseFloat(goalAmount) || 0;
    if (goalAmtNum > 0) {
      await dataService.addGoal({
        name: goalName || 'Emergency Fund Target',
        target_amount: goalAmtNum,
        current_amount: savNum,
        target_date: '2027-12-31',
        monthly_contribution: 10000,
        priority: 'high',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Financial Onboarding</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Step {step} of {totalSteps}</p>
            </div>
          </div>

          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Load Sample Data</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Wizard Step Forms */}
        <div className="my-6 space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 1: Monthly Income</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">What is your total monthly taking income (Salary + Freelance + Other)?</p>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xl font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 2: Monthly Fixed Expenses</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enter approximate monthly spending on Housing & Groceries.</p>
              <div>
                <label className="text-xs font-medium text-slate-500">Rent / Housing (₹)</label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Food & Dining (₹)</label>
                <input
                  type="number"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 3: Existing Loans & EMIs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add primary loan outstanding and monthly EMI burden.</p>
              <div>
                <label className="text-xs font-medium text-slate-500">Loan Name</label>
                <input
                  type="text"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Outstanding (₹)</label>
                  <input
                    type="number"
                    value={loanBalance}
                    onChange={(e) => setLoanBalance(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    value={loanEmi}
                    onChange={(e) => setLoanEmi(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 4: Gold Loans</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Do you have any active pledged gold loans?</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Gold Outstanding (₹)</label>
                  <input
                    type="number"
                    value={goldLoanBalance}
                    onChange={(e) => setGoldLoanBalance(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Monthly Payment (₹)</label>
                  <input
                    type="number"
                    value={goldLoanEmi}
                    onChange={(e) => setGoldLoanEmi(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 5: Savings & Emergency Fund</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total liquid bank savings or emergency fund available.</p>
              <div>
                <label className="text-xs font-medium text-slate-500">Emergency Fund Amount (₹)</label>
                <input
                  type="number"
                  value={emergencySavings}
                  onChange={(e) => setEmergencySavings(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 6: Investments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total invested portfolio value (Mutual Funds, Stocks, Gold, FDs).</p>
              <div>
                <label className="text-xs font-medium text-slate-500">Total Portfolio Value (₹)</label>
                <input
                  type="number"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 7: Primary Financial Goal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">What is your top priority goal right now?</p>
              <div>
                <label className="text-xs font-medium text-slate-500">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Target Amount (₹)</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={handleSkipAll}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Skip Wizard</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all"
          >
            <span>{step === totalSteps ? 'Generate Dashboard' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
