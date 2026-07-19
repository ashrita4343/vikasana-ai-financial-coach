import { useState } from 'react';
import type { Transaction } from './types';

const initialTransactions: Transaction[] = [
    { id: 1, name: 'Salary Deposit', category: 'Income', amount: 50000, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'credit' },
    { id: 2, name: 'Rent Payment', category: 'Bills', amount: 15000, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: 'debit' },
    { id: 3, name: 'Zara Shopping', category: 'Shopping', amount: 4500, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: 'debit' },
    { id: 4, name: 'Uber to work', category: 'Transport', amount: 250, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'debit' },
    { id: 5, name: 'Lunch at Cafe', category: 'Food', amount: 600, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'debit' },
    { id: 6, name: 'Movie Tickets', category: 'Entertainment', amount: 750, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'debit' },
    { id: 7, name: 'Swiggy Dinner', category: 'Food', amount: 350, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'debit' },
];

export const useMockData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prevTransactions => [transaction, ...prevTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  return { transactions, addTransaction };
};
