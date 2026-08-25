import type {
  IncomeItem,
  ExpenseItem,
  Loan,
  GoldLoan,
  SavingsItem,
  InvestmentItem,
  FinancialGoal,
  Budget,
  FinancialSummary,
  AdvisorRecommendation,
} from '../types';
import { formatINR, formatCompactINR } from '../utils/formatters';

export const generateAdvisorInsights = (
  summary: FinancialSummary,
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  loans: Loan[],
  goldLoans: GoldLoan[],
  savings: SavingsItem[],
  _investments: InvestmentItem[],
  _goals: FinancialGoal[],
  _budgets: Budget[]
): AdvisorRecommendation[] => {
  const recommendations: AdvisorRecommendation[] = [];

  // Data Sufficiency Check
  if (incomes.length === 0 && expenses.length === 0 && loans.length === 0 && goldLoans.length === 0) {
    return [
      {
        id: 'rec-no-data-income',
        priority: 'high',
        category: 'cashflow',
        title: '💼 Add Monthly Income',
        insight: 'No monthly income records found in your database.',
        recommendation: 'Add your monthly income to calculate your cash flow, savings rate, and financial health score.',
        actionType: 'income',
      },
      {
        id: 'rec-no-data-expense',
        priority: 'high',
        category: 'budget',
        title: '🛒 Start Recording Expenses',
        insight: 'No expense entries logged.',
        recommendation: 'Start recording expenses to analyze your spending habits and category breakdowns.',
        actionType: 'expenses',
      },
      {
        id: 'rec-no-data-loans',
        priority: 'medium',
        category: 'debt',
        title: '💳 No Active Debt Recorded',
        insight: 'No active personal or gold loans recorded.',
        recommendation: 'Your debt analysis and payoff schedule will appear here once you add a loan.',
        actionType: 'loans',
      },
    ];
  }

  // Individual Missing Data Callouts
  if (incomes.length === 0) {
    recommendations.push({
      id: 'rec-missing-income',
      priority: 'high',
      category: 'cashflow',
      title: '💼 Add Monthly Income',
      insight: 'No income records found.',
      recommendation: 'Add your monthly income to calculate your cash flow, EMI burden, and health score.',
      actionType: 'income',
    });
  }

  if (expenses.length === 0) {
    recommendations.push({
      id: 'rec-missing-expense',
      priority: 'high',
      category: 'budget',
      title: '🛒 Start Recording Expenses',
      insight: 'No expense records logged.',
      recommendation: 'Start recording expenses to analyze your spending concentration.',
      actionType: 'expenses',
    });
  }

  // PRIORITY 1: Avoid Negative Monthly Cash Flow
  if (summary.monthlyIncome > 0 && summary.monthlySurplus < 0) {
    const deficit = Math.abs(summary.monthlySurplus);
    recommendations.push({
      id: 'rec-cashflow-negative',
      priority: 'high',
      category: 'cashflow',
      title: '🚨 Critical: Monthly Deficit Detected',
      insight: `Your monthly outflows exceed your total monthly income of ${formatINR(summary.monthlyIncome)} by ${formatINR(deficit)}.`,
      recommendation: `Immediate action required: Reduce discretionary spending (e.g. Shopping, Outings) by ${formatINR(deficit)} or increase income to avoid debt accumulation.`,
      actionType: 'expenses',
    });
  } else if (summary.monthlyIncome > 0 && summary.monthlySurplus > 0) {
    recommendations.push({
      id: 'rec-cashflow-positive',
      priority: 'low',
      category: 'cashflow',
      title: '✅ Positive Monthly Cash Flow',
      insight: `You currently have a monthly surplus of ${formatINR(summary.monthlySurplus)} after paying expenses and commitments.`,
      recommendation: `Allocate a portion of this ${formatINR(summary.monthlySurplus)} surplus (${formatINR(Math.round(summary.monthlySurplus * 0.6))}) directly toward high-interest debt payoff or building your emergency fund.`,
      actionType: 'savings',
    });
  }

  // PRIORITY 2: Emergency Fund Check
  const emergencyFund = savings
    .filter((s) => s.type === 'Emergency Fund')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const targetEmergencyFund = summary.monthlyExpenses > 0 ? summary.monthlyExpenses * 6 : summary.monthlyIncome * 3;

  if (targetEmergencyFund > 0 && emergencyFund < targetEmergencyFund) {
    const deficit = targetEmergencyFund - emergencyFund;
    const monthsToGoal = summary.monthlySurplus > 0 ? Math.ceil(deficit / Math.min(summary.monthlySurplus, 15000)) : 12;
    recommendations.push({
      id: 'rec-emergency-fund',
      priority: emergencyFund === 0 ? 'high' : 'medium',
      category: 'emergency',
      title: '🛡️ Emergency Fund Below Target',
      insight: `Your current emergency fund is ${formatINR(emergencyFund)}, providing ${summary.emergencyFundMonths} months of expense buffer (Target: 6 months / ${formatINR(targetEmergencyFund)}).`,
      recommendation: `Allocating surplus directly will help reach your full target of ${formatINR(targetEmergencyFund)} in approximately ${monthsToGoal} months.`,
      potentialSavingsOrGain: `Goal target: ${formatINR(targetEmergencyFund)}`,
      actionType: 'savings',
    });
  }

  // PRIORITY 3 & 5: High Interest Debt & Gold Loans
  const activeLoans = loans.filter((l) => l.status === 'active' && l.current_outstanding > 0);
  const activeGoldLoans = goldLoans.filter((g) => g.status === 'active' && g.current_outstanding > 0);
  const totalGoldOutstanding = activeGoldLoans.reduce((sum, g) => sum + g.current_outstanding, 0);

  if (summary.monthlyIncome > 0 && summary.emiBurdenRate > 30) {
    recommendations.push({
      id: 'rec-emi-burden',
      priority: 'high',
      category: 'debt',
      title: '⚠️ High EMI Burden Ratio',
      insight: `Your total monthly debt payments (${formatINR(summary.monthlyEmi + summary.monthlyGoldLoanPayment)}) account for ${summary.emiBurdenRate}% of your monthly income (Recommended limit: < 30%).`,
      recommendation: `Focus on prepaying small high-interest loans to quickly free up monthly cash flow and lower your EMI burden below 30%.`,
      actionType: 'loans',
    });
  }

  // Gold Loan Callout
  if (totalGoldOutstanding > 0) {
    recommendations.push({
      id: 'rec-gold-loan',
      priority: 'medium',
      category: 'debt',
      title: '🔑 Gold Loan Debt Analysis',
      insight: `Your active gold loan outstanding balance is ${formatCompactINR(totalGoldOutstanding)} (${formatINR(totalGoldOutstanding)}) with monthly interest payments of ${formatINR(summary.monthlyGoldLoanPayment)}.`,
      recommendation: `Gold loans charge simple interest. Paying an additional amount toward principal will shorten the pledge duration and protect your gold asset.`,
      actionType: 'gold_loans',
    });
  }

  // High Interest Rate Loan Optimization
  if (activeLoans.length > 0) {
    const highestInterestLoan = [...activeLoans].sort((a, b) => b.interest_rate - a.interest_rate)[0];
    if (highestInterestLoan && highestInterestLoan.interest_rate >= 12) {
      recommendations.push({
        id: 'rec-highest-interest-loan',
        priority: 'high',
        category: 'debt',
        title: `🔥 Debt Avalanche Priority: ${highestInterestLoan.name}`,
        insight: `${highestInterestLoan.name} carries your highest annual interest rate of ${highestInterestLoan.interest_rate}% with an outstanding balance of ${formatINR(highestInterestLoan.current_outstanding)}.`,
        recommendation: `Prioritize extra repayments on ${highestInterestLoan.name} first. Paying this off ahead of lower-interest debt saves the maximum total interest over time.`,
        potentialSavingsOrGain: `Saves up to ${highestInterestLoan.interest_rate}% interest per year`,
        actionType: 'debt_payoff',
      });
    }
  }

  return recommendations;
};
