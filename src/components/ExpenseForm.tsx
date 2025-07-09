'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IExpense } from '@/models/Expense';

interface ExpenseFormProps {
  onExpenseAdded: (expense: IExpense) => void;
}

const categories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Health',
  'Education',
  'Other'
];

export default function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          category,
          date: new Date(date),
        }),
      });

      if (response.ok) {
        const newExpense = await response.json();
        onExpenseAdded(newExpense);
        setAmount('');
        setDescription('');
        setCategory('Food');
        setDate(new Date().toISOString().split('T')[0]);
      } else {
        console.error('Error adding expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-green-400 mb-3">
            Amount (₹)
          </label>
          <motion.input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            variants={inputVariants}
            whileFocus="focus"
            className="w-full px-4 py-3 bg-gray-900/50 border border-green-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
            placeholder="0.00"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-green-400 mb-3">
            Category
          </label>
          <motion.select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            variants={inputVariants}
            whileFocus="focus"
            className="w-full px-4 py-3 bg-gray-900/50 border border-green-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-900 text-white">
                {cat}
              </option>
            ))}
          </motion.select>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-green-400 mb-3">
          Description
        </label>
        <motion.input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={200}
          variants={inputVariants}
          whileFocus="focus"
          className="w-full px-4 py-3 bg-gray-900/50 border border-green-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
          placeholder="What did you spend on?"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-sm font-medium text-green-400 mb-3">
          Date
        </label>
        <motion.input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
        transition={{ delay: 0.5 }}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
          />
        ) : (
          'Add Expense'
        )}
      </motion.button>
    </motion.form>
  );
}