import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AddExpenseModal } from '../modals/AddExpenseModal';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  onRefreshData: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activePage,
  onNavigate,
  onRefreshData,
}) => {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        activePage={activePage}
        onNavigate={onNavigate}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      <div className="flex">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      <MobileNav
        activePage={activePage}
        onNavigate={onNavigate}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={onRefreshData}
      />
    </div>
  );
};
