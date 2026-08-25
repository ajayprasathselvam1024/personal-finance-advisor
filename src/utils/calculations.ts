import type {
  IncomeItem,
  ExpenseItem,
  Loan,
  GoldLoan,
  SavingsItem,
  InvestmentItem,
  FinancialSummary,
  HealthScoreBreakdown,
  FinancialGoal,
} from '../types';

/**
 * Calculates standard monthly EMI using reducing balance formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export const calculateEMI = (
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number => {
  if (!principal || principal <= 0 || !tenureMonths || tenureMonths <= 0) return 0;
  if (!annualInterestRate || annualInterestRate <= 0) {
    return Math.round(principal / tenureMonths);
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi);
};

/**
 * Computes live summary metrics from database arrays
 */
export const calculateFinancialSummary = (
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  loans: Loan[],
  goldLoans: GoldLoan[],
  savings: SavingsItem[],
  investments: InvestmentItem[],
  userMonthlyIncomeSetting: number = 0
): FinancialSummary => {
  // Monthly Income: calculate from current month or recurring income, fallback to profile setting
  const totalIncomeFromList = incomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const monthlyIncome = totalIncomeFromList > 0 ? totalIncomeFromList : userMonthlyIncomeSetting;

  // Monthly Expenses (exclude payment categories that represent EMI/Savings/Investment to prevent double counting)
  const monthlyExpenses = expenses
    .filter(
      (e) =>
        !['EMI', 'Gold Loan', 'Investment', 'Savings'].includes(e.category_name)
    )
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Active Loans monthly EMI
  const activeLoans = loans.filter((l) => l.status === 'active');
  const monthlyEmi = activeLoans.reduce((acc, curr) => acc + (curr.emi_amount || 0), 0);

  // Active Gold Loans monthly payment
  const activeGoldLoans = goldLoans.filter((g) => g.status === 'active');
  const monthlyGoldLoanPayment = activeGoldLoans.reduce((acc, curr) => acc + (curr.monthly_payment || 0), 0);

  // Total Outstanding Debt
  const loanDebt = activeLoans.reduce((acc, curr) => acc + (curr.current_outstanding || 0), 0);
  const goldLoanDebt = activeGoldLoans.reduce((acc, curr) => acc + (curr.current_outstanding || 0), 0);
  const totalOutstandingDebt = loanDebt + goldLoanDebt;

  // Total Savings & Monthly Savings
  const totalSavings = savings.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const monthlySavings = savings.reduce((acc, curr) => acc + (curr.expected_return_rate || 0 > 0 ? 0 : 0), 0); // we can also aggregate from recurring or monthly contribution

  // Total Investments & Monthly Investments
  const totalInvestments = investments.reduce((acc, curr) => acc + (curr.current_value || curr.invested_amount || 0), 0);
  const monthlyInvestments = investments.reduce((acc, curr) => acc + (curr.monthly_contribution || 0), 0);

  // Emergency Fund total
  const emergencyFundSavings = savings
    .filter((s) => s.type === 'Emergency Fund')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Monthly Total Commitments
  const totalDebtPayment = monthlyEmi + monthlyGoldLoanPayment;
  const monthlyOutflow = monthlyExpenses + totalDebtPayment + monthlyInvestments;
  const monthlySurplus = monthlyIncome - monthlyOutflow;

  // Ratios
  const emiBurdenRate = monthlyIncome > 0 ? (totalDebtPayment / monthlyIncome) * 100 : 0;
  const savingsRate = monthlyIncome > 0 ? ((monthlySavings + monthlyInvestments) / monthlyIncome) * 100 : 0;
  const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebtPayment / monthlyIncome) * 100 : 0;
  
  const estimatedMonthlyLivingExpenses = monthlyExpenses > 0 ? monthlyExpenses : monthlyIncome * 0.5;
  const emergencyFundMonths = estimatedMonthlyLivingExpenses > 0 ? emergencyFundSavings / estimatedMonthlyLivingExpenses : 0;

  // Net Worth = Total Assets (Savings + Investment Value) - Total Debt
  const netWorth = (totalSavings + totalInvestments) - totalOutstandingDebt;

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyEmi,
    monthlyGoldLoanPayment,
    monthlySavings,
    monthlyInvestments,
    monthlySurplus,
    totalOutstandingDebt,
    totalSavings,
    totalInvestments,
    netWorth,
    savingsRate: Math.round(savingsRate * 10) / 10,
    emiBurdenRate: Math.round(emiBurdenRate * 10) / 10,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
    emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
  };
};

/**
 * Calculates Financial Health Score from 0 to 100
 */
export const calculateFinancialHealthScore = (
  summary: FinancialSummary,
  _loans: Loan[],
  _savings: SavingsItem[],
  goals: FinancialGoal[]
): HealthScoreBreakdown => {

  // 1. Savings Rate Score (Max 20 pts)
  let savingsScore = 0;
  if (summary.savingsRate >= 30) savingsScore = 20;
  else if (summary.savingsRate >= 20) savingsScore = 16;
  else if (summary.savingsRate >= 10) savingsScore = 12;
  else if (summary.savingsRate > 0) savingsScore = 6;
  else savingsScore = 0;

  // 2. Emergency Fund Score (Max 20 pts)
  let emergencyFundScore = 0;
  if (summary.emergencyFundMonths >= 6) emergencyFundScore = 20;
  else if (summary.emergencyFundMonths >= 3) emergencyFundScore = 15;
  else if (summary.emergencyFundMonths >= 1) emergencyFundScore = 10;
  else if (summary.emergencyFundMonths > 0) emergencyFundScore = 5;
  else emergencyFundScore = 0;

  // 3. EMI & Debt Burden Score (Max 25 pts)
  let emiBurdenScore = 0;
  if (summary.emiBurdenRate === 0 && summary.totalOutstandingDebt === 0) emiBurdenScore = 25;
  else if (summary.emiBurdenRate <= 20) emiBurdenScore = 22;
  else if (summary.emiBurdenRate <= 35) emiBurdenScore = 16;
  else if (summary.emiBurdenRate <= 50) emiBurdenScore = 10;
  else emiBurdenScore = 3;

  // 4. Cash Flow Surplus Score (Max 15 pts)
  let expenseControlScore = 0;
  if (summary.monthlySurplus > summary.monthlyIncome * 0.25) expenseControlScore = 15;
  else if (summary.monthlySurplus > 0) expenseControlScore = 10;
  else if (summary.monthlySurplus === 0) expenseControlScore = 5;
  else expenseControlScore = 0;

  // 5. Investment Score (Max 10 pts)
  let investmentScore = 0;
  if (summary.totalInvestments > summary.monthlyIncome * 6) investmentScore = 10;
  else if (summary.totalInvestments > 0) investmentScore = 6;
  else investmentScore = 2;

  // 6. Goal Progress Score (Max 10 pts)
  let goalProgressScore = 5;
  if (goals.length > 0) {
    const totalGoalRatio = goals.reduce(
      (acc, g) => acc + (g.target_amount > 0 ? g.current_amount / g.target_amount : 0),
      0
    );
    const avgRatio = totalGoalRatio / goals.length;
    goalProgressScore = Math.min(10, Math.round(avgRatio * 10));
  }

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      savingsScore +
        emergencyFundScore +
        emiBurdenScore +
        expenseControlScore +
        investmentScore +
        goalProgressScore
    )
  );

  let rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' | 'Critical' = 'Fair';
  if (totalScore >= 85) rating = 'Excellent';
  else if (totalScore >= 70) rating = 'Good';
  else if (totalScore >= 55) rating = 'Fair';
  else if (totalScore >= 40) rating = 'Needs Attention';
  else rating = 'Critical';

  const keyStrengths: string[] = [];
  const keyImprovements: string[] = [];

  if (summary.savingsRate >= 20) keyStrengths.push(`Strong savings rate of ${summary.savingsRate}%`);
  if (summary.emergencyFundMonths >= 3) keyStrengths.push(`Healthy emergency buffer of ${summary.emergencyFundMonths} months`);
  if (summary.emiBurdenRate <= 30) keyStrengths.push(`Manageable EMI burden of ${summary.emiBurdenRate}%`);
  if (summary.monthlySurplus > 0) keyStrengths.push('Positive monthly cash flow surplus');

  if (summary.emergencyFundMonths < 3) keyImprovements.push('Emergency fund is below target 3-6 months buffer');
  if (summary.emiBurdenRate > 35) keyImprovements.push(`High EMI burden ratio (${summary.emiBurdenRate}% of income)`);
  if (summary.monthlySurplus < 0) keyImprovements.push('Monthly expenses exceed income (Negative cash flow)');
  if (summary.totalInvestments === 0) keyImprovements.push('No long-term investments recorded yet');

  return {
    score: totalScore,
    rating,
    savingsScore,
    emergencyFundScore,
    emiBurdenScore,
    debtLevelScore: emiBurdenScore,
    expenseControlScore,
    investmentScore,
    goalProgressScore,
    keyStrengths: keyStrengths.length > 0 ? keyStrengths : ['Regular financial tracking active'],
    keyImprovements: keyImprovements.length > 0 ? keyImprovements : ['Maintain current momentum'],
  };
};

/**
 * Calculates Debt Payoff Timeline using Avalanche (highest interest rate first)
 * or Snowball (lowest balance first)
 */
export interface DebtPayoffPlan {
  strategy: 'avalanche' | 'snowball';
  totalOutstanding: number;
  totalInterestPaid: number;
  monthsToPayoff: number;
  originalPayoffMonths: number;
  monthsSaved: number;
  interestSaved: number;
  orderedLoans: {
    id: string;
    name: string;
    outstanding: number;
    interestRate: number;
    emi: number;
    payoffMonth: number;
  }[];
}

export const calculateDebtPayoffSchedule = (
  loans: Loan[],
  goldLoans: GoldLoan[],
  extraMonthlyPayment: number = 0,
  strategy: 'avalanche' | 'snowball' = 'avalanche'
): DebtPayoffPlan => {
  const allDebts = [
    ...loans
      .filter((l) => l.status === 'active' && l.current_outstanding > 0)
      .map((l) => ({
        id: l.id,
        name: l.name,
        outstanding: l.current_outstanding,
        interestRate: l.interest_rate,
        emi: l.emi_amount,
        remainingTenure: l.remaining_tenure,
      })),
    ...goldLoans
      .filter((g) => g.status === 'active' && g.current_outstanding > 0)
      .map((g) => ({
        id: g.id,
        name: `Gold Loan: ${g.name}`,
        outstanding: g.current_outstanding,
        interestRate: g.interest_rate,
        emi: g.monthly_payment,
        remainingTenure: 24, // default estimate
      })),
  ];

  if (allDebts.length === 0) {
    return {
      strategy,
      totalOutstanding: 0,
      totalInterestPaid: 0,
      monthsToPayoff: 0,
      originalPayoffMonths: 0,
      monthsSaved: 0,
      interestSaved: 0,
      orderedLoans: [],
    };
  }

  // Sort debts based on strategy
  const sortedDebts = [...allDebts].sort((a, b) => {
    if (strategy === 'avalanche') {
      return b.interestRate - a.interestRate; // Highest interest first
    } else {
      return a.outstanding - b.outstanding; // Lowest balance first
    }
  });

  const totalOutstanding = sortedDebts.reduce((acc, d) => acc + d.outstanding, 0);

  // Baseline calculation without extra payment
  const maxBaseTenure = Math.max(...sortedDebts.map((d) => d.remainingTenure || 12));
  const estimatedBaseInterest = sortedDebts.reduce(
    (acc, d) => acc + (d.outstanding * (d.interestRate / 100) * (d.remainingTenure / 12)),
    0
  );

  // Accelerated payoff simulation with extra payment
  let currentDebts = sortedDebts.map((d) => ({ ...d }));
  let monthCounter = 0;
  let totalInterestWithExtra = 0;
  const orderedPayoff: { id: string; name: string; outstanding: number; interestRate: number; emi: number; payoffMonth: number }[] = [];

  while (currentDebts.some((d) => d.outstanding > 0) && monthCounter < 360) {
    monthCounter++;
    let extraAvailable = extraMonthlyPayment;

    for (let i = 0; i < currentDebts.length; i++) {
      const debt = currentDebts[i];
      if (debt.outstanding <= 0) continue;

      const monthlyInterest = (debt.outstanding * (debt.interestRate / 100)) / 12;
      totalInterestWithExtra += monthlyInterest;

      let payment = debt.emi + (i === 0 ? extraAvailable : 0);
      let principalPaid = payment - monthlyInterest;

      if (principalPaid < 0) principalPaid = 0;

      if (debt.outstanding <= principalPaid) {
        extraAvailable += (principalPaid - debt.outstanding);
        debt.outstanding = 0;
        orderedPayoff.push({
          id: debt.id,
          name: debt.name,
          outstanding: debt.outstanding,
          interestRate: debt.interestRate,
          emi: debt.emi,
          payoffMonth: monthCounter,
        });
      } else {
        debt.outstanding -= principalPaid;
      }
    }
  }

  const monthsToPayoff = monthCounter;
  const monthsSaved = Math.max(0, maxBaseTenure - monthsToPayoff);
  const interestSaved = Math.max(0, Math.round(estimatedBaseInterest - totalInterestWithExtra));

  return {
    strategy,
    totalOutstanding,
    totalInterestPaid: Math.round(totalInterestWithExtra),
    monthsToPayoff,
    originalPayoffMonths: maxBaseTenure,
    monthsSaved,
    interestSaved,
    orderedLoans: orderedPayoff.length > 0 ? orderedPayoff : sortedDebts.map((d) => ({ ...d, payoffMonth: d.remainingTenure })),
  };
};
