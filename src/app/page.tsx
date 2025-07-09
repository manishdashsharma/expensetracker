'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseForm from '@/components/ExpenseForm';
import GoalForm from '@/components/GoalForm';
import ExpenseChart from '@/components/ExpenseChart';
import ReportFilters from '@/components/ReportFilters';
import { IExpense } from '@/models/Expense';
import { IGoal } from '@/models/Goal';

export default function Home() {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [goal, setGoal] = useState<IGoal | null>(null);
  const [filterDays, setFilterDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
    fetchGoal();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoal = async () => {
    try {
      const response = await fetch('/api/goal');
      const data = await response.json();
      setGoal(data);
    } catch (error) {
      console.error('Error fetching goal:', error);
    }
  };

  const handleExpenseAdded = (expense: IExpense) => {
    setExpenses([...expenses, expense]);
  };

  const handleGoalSet = (newGoal: IGoal) => {
    setGoal(newGoal);
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    return expenseDate >= cutoffDate;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingAmount = goal ? goal.bankAmount - totalExpenses : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-green-400 text-lg font-medium"
          >
            Loading your financial dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 py-8"
      >
        <motion.h1
          variants={itemVariants}
          className="text-6xl font-bold text-center mb-12 gradient-text text-shadow"
        >
          MoneyTracker Pro
        </motion.h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Goal Section */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="xl:col-span-2 glass-card p-8 hover-lift smooth-transition"
          >
            <h2 className="text-3xl font-semibold mb-6 text-green-400 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
              />
              Financial Overview
            </h2>
            <AnimatePresence mode="wait">
              {goal ? (
                <motion.div
                  key="goal-display"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl border border-green-500/30">
                      <div className="text-sm text-green-300 mb-2">Bank Amount</div>
                      <div className="text-3xl font-bold text-green-400">₹{goal.bankAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-6 rounded-2xl border border-red-500/30">
                      <div className="text-sm text-red-300 mb-2">Spent ({filterDays} days)</div>
                      <div className="text-3xl font-bold text-red-400">₹{totalExpenses.toLocaleString()}</div>
                    </div>
                    <div className={`bg-gradient-to-br p-6 rounded-2xl border ${
                      remainingAmount >= 0 
                        ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' 
                        : 'from-red-500/20 to-pink-500/20 border-red-500/30'
                    }`}>
                      <div className="text-sm text-green-300 mb-2">Remaining</div>
                      <div className={`text-3xl font-bold ${remainingAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{remainingAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-gray-300">Progress</span>
                      <span className="text-sm text-gray-400">
                        {Math.min((totalExpenses / goal.bankAmount) * 100, 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalExpenses / goal.bankAmount) * 100, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="goal-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <GoalForm onGoalSet={handleGoalSet} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="glass-card p-8 hover-lift smooth-transition"
          >
            <h2 className="text-3xl font-semibold mb-6 text-green-400 flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
              />
              Quick Stats
            </h2>
            <ReportFilters filterDays={filterDays} onFilterChange={setFilterDays} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 mt-6"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Expenses</span>
                <span className="text-2xl font-bold text-red-400">₹{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average per day</span>
                <span className="text-2xl font-bold text-yellow-400">
                  ₹{(totalExpenses / filterDays).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Transactions</span>
                <span className="text-2xl font-bold text-green-400">{filteredExpenses.length}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Chart Section */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="glass-card p-8 mb-8 hover-lift smooth-transition"
        >
          <h2 className="text-3xl font-semibold mb-6 text-green-400 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
            />
            Analytics Dashboard
          </h2>
          <ExpenseChart expenses={filteredExpenses} />
        </motion.div>

        {/* Add Expense Form */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="glass-card p-8 hover-lift smooth-transition"
        >
          <h2 className="text-3xl font-semibold mb-6 text-green-400 flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
            />
            Add New Expense
          </h2>
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        </motion.div>
      </motion.div>
    </div>
  );
}