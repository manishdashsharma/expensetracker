'use client';

import { useState, useEffect } from 'react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-light text-gray-900 text-center mb-6 sm:mb-8">
          Money Tracker
        </h1>
        
        <div className="space-y-6 sm:space-y-8">
          {/* Goal Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4">Overview</h2>
            {goal ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600 mb-1">Bank Amount</div>
                    <div className="text-xl sm:text-2xl font-medium text-gray-900">₹{goal.bankAmount.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600 mb-1">Spent ({filterDays} days)</div>
                    <div className="text-xl sm:text-2xl font-medium text-gray-900">₹{totalExpenses.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600 mb-1">Remaining</div>
                    <div className={`text-xl sm:text-2xl font-medium ${remainingAmount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      ₹{remainingAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm text-gray-600">
                      {Math.min((totalExpenses / goal.bankAmount) * 100, 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((totalExpenses / goal.bankAmount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <GoalForm onGoalSet={handleGoalSet} />
            )}
          </div>

          {/* Stats Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4">Statistics</h2>
            <ReportFilters filterDays={filterDays} onFilterChange={setFilterDays} />
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Expenses</span>
                <span className="font-medium text-gray-900">₹{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average per day</span>
                <span className="font-medium text-gray-900">
                  ₹{(totalExpenses / filterDays).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transactions</span>
                <span className="font-medium text-gray-900">{filteredExpenses.length}</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4">Analytics</h2>
            <ExpenseChart expenses={filteredExpenses} />
          </div>

          {/* Add Expense Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-4">Add Expense</h2>
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </div>
        </div>
      </div>
    </div>
  );
}