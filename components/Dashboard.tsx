import React from 'react';
import type { Transaction, Challenge } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  challenges: Challenge[];
}

// Icon mapping for transaction categories
const categoryIcons: Record<Transaction['category'], string> = {
    Income: '💰',
    Food: '🍔',
    Shopping: '🛍️',
    Transport: '🚗',
    Entertainment: '🎬',
    Bills: '🧾',
};

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <li className="flex items-center justify-between py-3">
        <div className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center text-xl">
                {categoryIcons[transaction.category]}
            </div>
            <div>
                <p className="font-medium text-gray-800">{transaction.name}</p>
                <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
        </div>
        <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-500' : 'text-gray-800'}`}>
            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
        </p>
    </li>
);

const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 min-w-[250px] flex-shrink-0">
        <p className="font-semibold text-emerald-800">{challenge.title}</p>
        <p className="text-sm text-emerald-600 mb-2">{challenge.description}</p>
        <div className="w-full bg-emerald-100 rounded-full h-2.5 mb-1">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${challenge.progress}%` }}></div>
        </div>
        <div className="text-xs text-emerald-700 flex justify-between">
            <span>Progress: {challenge.progress}%</span>
            <span>🏆 {challenge.reward}</span>
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ transactions, challenges }) => {
    const totalIncome = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
    const totalSpending = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="p-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Hello there!</h1>
                <p className="text-gray-500">Here's your financial wellness overview.</p>
            </header>
            
            <div className="bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/40">
                <p className="text-sm opacity-80">Account Balance</p>
                <p className="text-3xl font-bold tracking-tight">₹{(totalIncome - totalSpending).toLocaleString('en-IN')}</p>
                <div className="flex justify-between mt-4 text-sm">
                    <div>
                        <p className="opacity-80">Income</p>
                        <p className="font-semibold">₹{totalIncome.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="opacity-80">Spending</p>
                        <p className="font-semibold">₹{totalSpending.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Active Challenges</h2>
                <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
                    {challenges.map(challenge => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Recent Transactions</h2>
                <ul className="divide-y divide-gray-100">
                    {transactions.slice(0, 5).map(transaction => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                </ul>
            </section>
        </div>
    );
};
