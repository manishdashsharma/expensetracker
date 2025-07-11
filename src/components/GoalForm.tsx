'use client';

import { useState } from 'react';
import { IGoal } from '@/models/Goal';

interface GoalFormProps {
  onGoalSet: (goal: IGoal) => void;
}

export default function GoalForm({ onGoalSet }: GoalFormProps) {
  const [bankAmount, setBankAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankAmount: parseFloat(bankAmount),
          startDate: new Date(startDate),
        }),
      });

      if (response.ok) {
        const newGoal = await response.json();
        onGoalSet(newGoal);
        setBankAmount('');
        setStartDate(new Date().toISOString().split('T')[0]);
      } else {
        console.error('Error setting goal');
      }
    } catch (error) {
      console.error('Error setting goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bank Amount (₹)
        </label>
        <input
          type="number"
          value={bankAmount}
          onChange={(e) => setBankAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900 bg-white"
          placeholder="How much money do you have in your bank?"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-900 bg-white"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-4 text-base rounded-md transition-colors duration-200 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        ) : (
          'Set Financial Goal'
        )}
      </button>
    </form>
  );
}