import React from 'react';
import type { Nudge } from '../types';
import { XMarkIcon } from './icons/Icons';

interface NudgeModalProps {
  nudge: Nudge;
  onClose: () => void;
  onSave: (amount: number) => void;
  isLoading: boolean;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({ nudge, onClose, onSave, isLoading }) => {
  const parseSaveAmount = (suggestion: string): number => {
    const match = suggestion.match(/₹(\d+)/);
    return match ? parseInt(match[1], 10) : 100; // Default to 100 if not found
  };
  
  const saveAmount = parseSaveAmount(nudge.suggestion);

  if (typeof document !== 'undefined' && !document.getElementById('nudge-animations')) {
    const style = document.createElement('style');
    style.id = 'nudge-animations';
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slide-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
    `;
    document.head.append(style);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-40 animate-fade-in">
      <div className="bg-white rounded-t-2xl p-6 w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-emerald-600">A friendly nudge! ✨</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon />
          </button>
        </div>
        <div className="text-center">
          <p className="text-gray-700 mb-2">
            Just noticed your purchase at <span className="font-semibold">{nudge.transaction.name}</span> for <span className="font-semibold">₹{nudge.transaction.amount}</span>.
          </p>
          <p className="text-lg text-gray-800 font-medium mb-6">{nudge.suggestion}</p>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
            >
              Maybe next time
            </button>
            <button
              onClick={() => onSave(saveAmount)}
              className="w-full py-3 px-4 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
            >
              Yes, save ₹{saveAmount}!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
