# WealthWise - Personal Finance Management & AI Advisor 💎

A full-stack, production-ready personal finance management web application and intelligent AI financial advisor built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Recharts**, and **Supabase PostgreSQL** with Row Level Security (RLS).

---

## 🌟 Key Features

1. **Intelligent AI Financial Advisor Engine**:
   - Analyzes real database records (Income, Expenses, EMIs, Gold loans, Savings, Investments, Budgets, Goals, Cash flow).
   - Generates non-generic, prioritized actionable recommendations based on practical rules (Negative cash flow prevention -> Emergency fund -> High-interest debt avalanche -> Surplus deployment).

2. **Financial Health Score (0 to 100)**:
   - Dynamic 0-100 rating evaluated across 7 financial pillars (Savings rate, Emergency buffer, EMI burden ratio, Cash flow surplus, Debt levels, Investment rate, Goal velocity).

3. **Complete Debt & Gold Loan Management**:
   - Track personal loans, vehicle loans, credit cards, consumer loans, and gold loans with pledged gold details.
   - Auto-calculates monthly EMI burden, interest component, remaining tenure, and maturity dates.

4. **Debt Payoff & What-If Scenario Planners**:
   - **Avalanche** (highest interest first) & **Snowball** (lowest balance first) strategies.
   - Simulator for extra monthly payments (calculates exact months saved and interest saved).
   - **What-If Sandbox** to test income/expense/loan scenarios without mutating base database data.

5. **Indian Rupee (INR) Standard Formatting**:
   - Formatted natively using Indian Rupee standards (`₹91,000`, `₹2,70,000`, `₹7,00,000`).

6. **Unified Transaction Register & 10 Financial Reports**:
   - CSV Export for all transactions, income, expense, and loan statements.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend / Database**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS).
- **Deployment**: Configured for Netlify FREE Tier (`netlify.toml` with SPA redirects `/* /index.html 200`).

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start Vite local development server
npm run dev
```

---

## 🗄️ Supabase PostgreSQL Setup Guide

1. Log in to [Supabase Free Tier](https://supabase.com) and create a new project.
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Open `supabase/schema.sql` from this project, copy the entire SQL script, and click **Run**.
4. This script automatically creates all normalized tables (`profiles`, `income`, `expenses`, `loans`, `gold_loans`, `savings`, `investments`, `budgets`, `financial_goals`, `notifications`), indexes, triggers, and Row Level Security (RLS) policies enforcing `auth.uid() = user_id`.
5. Go to **Project Settings -> API** in Supabase and copy:
   - `Project URL`
   - `anon public key`
6. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## ☁️ Deployment to Netlify (FREE Plan)

1. Push this repository to GitHub.
2. Log in to [Netlify](https://netlify.com) and click **Add new site -> Import an existing project**.
3. Select your GitHub repository.
4. Set Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Go to **Site settings -> Environment variables** in Netlify and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy site**.
