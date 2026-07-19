
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { Coach } from './components/Coach';
import { NudgeModal } from './components/NudgeModal';
import { useMockData } from './hooks/useMockData';
import type { Transaction, Challenge, Nudge } from './types';
import { generateNudgeForTransaction } from './services/geminiService';
import { HomeIcon, SparklesIcon, XMarkIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'coach'>('dashboard');
  const { transactions, addTransaction } = useMockData();
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, title: 'No-Spend Weekend', description: 'Avoid any non-essential spending for 48 hours.', progress: 60, goal: 100, reward: 'Bronze Badge' },
    { id: 2, title: 'Coffee Break Challenge', description: 'Save ₹50 by skipping one coffee purchase.', progress: 0, goal: 50, reward: 'Caffeine Saver Badge' },
  ]);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [isNudgeLoading, setIsNudgeLoading] = useState<boolean>(false);

  const handleTransactionAnalysis = useCallback(async (transaction: Transaction) => {
    if (transaction.category === 'Food' && transaction.amount > 300) {
      setIsNudgeLoading(true);
      try {
        const nudgeText = await generateNudgeForTransaction(transaction, transactions);
        if (nudgeText) {
          setNudge({
            transaction,
            suggestion: nudgeText,
          });
        }
      } catch (error) {
        console.error("Failed to generate nudge:", error);
        // Optionally set a default nudge on error
      } finally {
        setIsNudgeLoading(false);
      }
    }
  }, [transactions]);

  useEffect(() => {
    // Simulate a new impulsive transaction after 5 seconds to demonstrate the nudge feature
    const timer = setTimeout(() => {
      const newTransaction: Transaction = {
        id: Date.now(),
        name: 'Zomato Late Night Order',
        category: 'Food',
        amount: 450,
        date: new Date().toISOString(),
        type: 'debit',
      };
      addTransaction(newTransaction);
      handleTransactionAnalysis(newTransaction);
    }, 5000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleSave = (amount: number) => {
    console.log(`Saved ₹${amount} towards a goal!`);
    setNudge(null);
  };
  
  const NavButton: React.FC<{
    view: 'dashboard' | 'coach';
    label: string;
    icon: React.ReactNode;
  }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        activeView === view ? 'text-emerald-500' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-md mx-auto bg-white shadow-lg flex flex-col" style={{height: '100vh'}}>
        <main className="flex-1 overflow-y-auto pb-20">
          {activeView === 'dashboard' && <Dashboard transactions={transactions} challenges={challenges} />}
          {activeView === 'coach' && <Coach transactions={transactions} />}
        </main>

        {nudge && (
          <NudgeModal
            nudge={nudge}
            onClose={() => setNudge(null)}
            onSave={handleSave}
            isLoading={isNudgeLoading}
          />
        )}
        
        {isNudgeLoading && !nudge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="text-gray-600">Analyzing transaction...</span>
            </div>
          </div>
        )}

        <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 shadow-t-lg">
          <div className="flex justify-around items-center h-16">
            <NavButton view="dashboard" label="Home" icon={<HomeIcon />} />
            <NavButton view="coach" label="AI Coach" icon={<SparklesIcon />} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
