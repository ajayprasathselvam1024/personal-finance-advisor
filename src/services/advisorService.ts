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
  _incomes: IncomeItem[],
  expenses: ExpenseItem[],
  loans: Loan[],
  goldLoans: GoldLoan[],
  savings: SavingsItem[],
  _investments: InvestmentItem[],
  _goals: FinancialGoal[],
  _budgets: Budget[]
): AdvisorRecommendation[] => {
  const recommendations: AdvisorRecommendation[] = [];

  // PRIORITY 1: Avoid Negative Monthly Cash Flow
  if (summary.monthlySurplus < 0) {
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
  } else {
    recommendations.push({
      id: 'rec-cashflow-positive',
      priority: 'low',
      category: 'cashflow',
      title: '✅ Positive Monthly Cash Flow',
      insight: `You currently have a healthy monthly surplus of ${formatINR(summary.monthlySurplus)} after paying all expenses and commitments.`,
      recommendation: `Allocate at least 60% of this ${formatINR(summary.monthlySurplus)} surplus (${formatINR(Math.round(summary.monthlySurplus * 0.6))}) directly toward high-interest debt payoff or building your emergency fund.`,
      actionType: 'savings',
    });
  }

  // PRIORITY 2: Emergency Fund Check
  const emergencyFund = savings
    .filter((s) => s.type === 'Emergency Fund')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const targetEmergencyFund = summary.monthlyExpenses > 0 ? summary.monthlyExpenses * 6 : summary.monthlyIncome * 3;

  if (emergencyFund < targetEmergencyFund) {
    const deficit = targetEmergencyFund - emergencyFund;
    const monthsToGoal = summary.monthlySurplus > 0 ? Math.ceil(deficit / Math.min(summary.monthlySurplus, 15000)) : 12;
    recommendations.push({
      id: 'rec-emergency-fund',
      priority: emergencyFund === 0 ? 'high' : 'medium',
      category: 'emergency',
      title: '🛡️ Emergency Fund Below Target',
      insight: `Your current emergency fund is ${formatINR(emergencyFund)}, providing only ${summary.emergencyFundMonths} months of expense buffer (Target: 6 months / ${formatINR(targetEmergencyFund)}).`,
      recommendation: `At your current savings rate, allocating ${formatINR(15000)}/month will reach your full target of ${formatINR(targetEmergencyFund)} in approximately ${monthsToGoal} months.`,
      potentialSavingsOrGain: `Goal target: ${formatINR(targetEmergencyFund)}`,
      actionType: 'savings',
    });
  }

  // PRIORITY 3 & 5: High Interest Debt & Gold Loans
  const activeLoans = loans.filter((l) => l.status === 'active' && l.current_outstanding > 0);
  const activeGoldLoans = goldLoans.filter((g) => g.status === 'active' && g.current_outstanding > 0);
  const totalGoldOutstanding = activeGoldLoans.reduce((sum, g) => sum + g.current_outstanding, 0);

  if (summary.emiBurdenRate > 30) {
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
      recommendation: `Gold loans charge simple interest. Paying an additional ${formatINR(2000)}/month toward principal will shorten the pledge duration and protect your gold asset from auction risk.`,
      actionType: 'gold_loans',
    });
  }

  // High Interest Rate Loan Optimization (Avalanche Recommendation)
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

  // PRIORITY 4: Category Expense Spikes & Budget Exceed Checks
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category_name] = (categoryTotals[e.category_name] || 0) + e.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && summary.monthlyExpenses > 0) {
    const percent = Math.round((topCategory[1] / summary.monthlyExpenses) * 100);
    if (percent > 25) {
      recommendations.push({
        id: 'rec-expense-spike',
        priority: 'medium',
        category: 'budget',
        title: `📊 Spending Concentration: ${topCategory[0]}`,
        insight: `${topCategory[0]} expenses total ${formatINR(topCategory[1])}, representing ${percent}% of your entire monthly spending.`,
        recommendation: `Review recent transactions in ${topCategory[0]}. Reducing this single category by 15% would liberate ${formatINR(Math.round(topCategory[1] * 0.15))} monthly for savings.`,
        potentialSavingsOrGain: `Potential monthly save: ${formatINR(Math.round(topCategory[1] * 0.15))}`,
        actionType: 'categories',
      });
    }
  }

  // PRIORITY 6 & 7: Investment & Long-term Goals
  if (summary.monthlySurplus > 5000 && summary.emergencyFundMonths >= 3) {
    recommendations.push({
      id: 'rec-investment-growth',
      priority: 'low',
      category: 'investment',
      title: '📈 Wealth Building Opportunity',
      insight: `With a healthy cash flow surplus and baseline emergency fund in place, your current investment contribution is ${formatINR(summary.monthlyInvestments)}/month.`,
      recommendation: `Consider starting a Systematic Investment Plan (SIP) in low-cost index funds or mutual funds with a portion of your ${formatINR(summary.monthlySurplus)} surplus.`,
      actionType: 'investments',
    });
  }

  return recommendations;
};
