import React, { useState } from 'react';
import { ArrowRight, Sparkles, SkipForward } from 'lucide-react';
import { dataService } from '../../services/dataService';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  // Form State - Empty initial values
  const [income, setIncome] = useState('');
  const [rent, setRent] = useState('');
  const [food, setFood] = useState('');
  const [loanName, setLoanName] = useState('');
  const [loanBalance, setLoanBalance] = useState('');
  const [loanEmi, setLoanEmi] = useState('');
  const [goldLoanBalance, setGoldLoanBalance] = useState('');
  const [goldLoanEmi, setGoldLoanEmi] = useState('');
  const [emergencySavings, setEmergencySavings] = useState('');
  const [investments, setInvestments] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');

  const totalSteps = 7;

  const handleNext = async () => {
    await saveCurrentStepData(step);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      localStorage.setItem('fin_onboarding_done', 'true');
      onComplete();
    }
  };

  const handleSkipStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      localStorage.setItem('fin_onboarding_done', 'true');
      onComplete();
    }
  };

  const handleSkipAll = () => {
    localStorage.setItem('fin_onboarding_done', 'true');
    onComplete();
  };

  const saveCurrentStepData = async (currentStep: number) => {
    if (currentStep === 1) {
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
    } else if (currentStep === 2) {
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
    } else if (currentStep === 3) {
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
          tenure_months: 36,
          remaining_tenure: 36,
          start_date: new Date().toISOString().split('T')[0],
          due_date_day: 5,
          lender: 'Lender',
          status: 'active',
        });
      }
    } else if (currentStep === 4) {
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
          gold_pledged_description: 'Pledged Ornaments',
          status: 'active',
        });
      }
    } else if (currentStep === 5) {
      const savNum = parseFloat(emergencySavings) || 0;
      if (savNum > 0) {
        await dataService.addSavings({
          name: 'Emergency Savings Account',
          type: 'Emergency Fund',
          amount: savNum,
          expected_return_rate: 5.0,
          date: new Date().toISOString().split('T')[0],
        });
      }
    } else if (currentStep === 6) {
      const invNum = parseFloat(investments) || 0;
      if (invNum > 0) {
        await dataService.addInvestment({
          name: 'Mutual Fund Investment',
          type: 'Mutual Funds',
          invested_amount: invNum,
          current_value: invNum,
          monthly_contribution: 0,
          expected_return_rate: 12.0,
          date: new Date().toISOString().split('T')[0],
        });
      }
    } else if (currentStep === 7) {
      const goalAmtNum = parseFloat(goalAmount) || 0;
      if (goalAmtNum > 0) {
        await dataService.addGoal({
          name: goalName || 'Financial Goal Target',
          target_amount: goalAmtNum,
          current_amount: 0,
          target_date: '2027-12-31',
          monthly_contribution: 0,
          priority: 'high',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-slate-100">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-800">
        {/* Welcome Header */}
        <div className="pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Welcome to My Finance</h2>
              <p className="text-xs text-slate-400 mt-0.5">Let's set up your financial profile. Step {step} of {totalSteps}</p>
            </div>
          </div>

          <button
            onClick={handleSkipAll}
            className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <SkipForward className="h-3.5 w-3.5" />
            <span>Skip All</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Wizard Step Forms */}
        <div className="my-6 space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Step 1: Add Monthly Income</h3>
              <p className="text-xs text-slate-400">What is your total monthly income (Salary, Business, Freelance)?</p>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-xl font-bold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Step 2: Add Monthly Expenses</h3>
              <p className="text-xs text-slate-400">Enter spending estimates for major monthly categories.</p>
              <div>
                <label className="text-xs font-semibold text-slate-400">Rent / Housing (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Food & Dining (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Step 3: Add Existing Loans & EMIs</h3>
              <p className="text-xs text-slate-400">Add an active loan balance and monthly EMI burden if applicable.</p>
              <div>
                <label className="text-xs font-semibold text-slate-400">Loan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Personal Loan, Vehicle Loan"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Outstanding (₹)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={loanBalance}
                    onChange={(e) => setLoanBalance(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={loanEmi}
                    onChange={(e) => setLoanEmi(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Step 4: Add Gold Loans</h3>
              <p className="text-xs text-slate-400">Do you have any active pledged gold loan balances?</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Gold Outstanding (₹)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={goldLoanBalance}
                    onChange={(e) => setGoldLoanBalance(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Monthly Interest Payment (₹)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={goldLoanEmi}
                    onChange={(e) => setGoldLoanEmi(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Step 5: Add Savings</h3>
              <p className="text-xs text-slate-400">Total liquid bank savings or emergency fund available.</p>
              <div>
                <label className="text-xs font-semibold text-slate-400">Emergency Fund Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={emergencySavings}
                  onChange={(e) => setEmergencySavings(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Step 6: Add Investments</h3>
              <p className="text-xs text-slate-400">Total invested portfolio value (Mutual Funds, Stocks, FDs).</p>
              <div>
                <label className="text-xs font-semibold text-slate-400">Total Portfolio Value (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Step 7: Create Financial Goals</h3>
              <p className="text-xs text-slate-400">What is your primary financial goal target right now?</p>
              <div>
                <label className="text-xs font-semibold text-slate-400">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Reserve, Car Down Payment"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Target Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleSkipStep}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            <SkipForward className="h-3.5 w-3.5" />
            <span>Skip Step</span>
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition-all"
            >
              <span>{step === totalSteps ? 'Save & Go to Dashboard' : 'Save & Continue'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
