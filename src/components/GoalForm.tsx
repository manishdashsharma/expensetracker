'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-green-400 mb-3">
          Bank Amount (₹)
        </label>
        <motion.input
          type="number"
          value={bankAmount}
          onChange={(e) => setBankAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          variants={inputVariants}
          whileFocus="focus"
          className="w-full px-4 py-3 bg-gray-900/50 border border-green-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
          placeholder="How much money do you have in your bank?"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-green-400 mb-3">
          Start Date
        </label>
        <motion.input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          variants={inputVariants}
          whileFocus="focus"
          className="w-full px-4 py-3 bg-gray-900/50 border border-green-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
        />
      </motion.div>
      
      <motion.button
        type="submit"
        disabled={loading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
          />
        ) : (
          'Set Financial Goal'
        )}
      </motion.button>
    </motion.form>
  );
}