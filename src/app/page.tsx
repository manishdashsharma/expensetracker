'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseChart from '@/components/ExpenseChart';
import ReportsDashboard from '@/components/ReportsDashboard';
import ReportFilters from '@/components/ReportFilters';
import { IExpense } from '@/models/Expense';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, List, Target, TrendingUp, Wallet, Loader2 } from 'lucide-react';

export default function Home() {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [filterDays, setFilterDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchExpenses();
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

  const handleExpenseAdded = (expense: IExpense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleExpenseUpdated = (updatedExpense: IExpense) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense._id === updatedExpense._id ? updatedExpense : expense
      )
    );
  };

  const handleExpenseDeleted = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
  };


  // Calculate summary statistics
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    return expenseDate >= cutoffDate;
  });

  const totalIncome = filteredExpenses
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpenses = filteredExpenses
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-6">
          <CardContent className="flex items-center gap-4 p-0">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div>
              <p className="font-medium">Loading your financial data...</p>
              <p className="text-sm text-muted-foreground">Please wait a moment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">
                  Finance Tracker
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Manage your expenses and income efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="hidden md:flex text-xs">
                {expenses.length} transactions
              </Badge>
              <div className="scale-90 sm:scale-100">
                <ReportFilters filterDays={filterDays} onFilterChange={setFilterDays} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Income</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                    ₹{totalIncome.toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Expenses</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Net Balance</p>
                  <p className={`text-lg sm:text-2xl font-bold truncate ${
                    netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{netBalance.toLocaleString()}
                  </p>
                </div>
                <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 self-end sm:self-auto ${
                  netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Wallet className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Transactions</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {filteredExpenses.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last {filterDays} days
                  </p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
                  <List className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Add Section */}
        <Card className="mb-4 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Quick Add Transaction
            </CardTitle>
            <CardDescription className="text-sm">
              Quickly add your daily income or expense transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-11 sm:h-10">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden lg:inline">Overview</span>
              <span className="xs:hidden lg:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <List className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden lg:inline">Transactions</span>
              <span className="xs:hidden lg:hidden">📋</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden lg:inline">Reports</span>
              <span className="xs:hidden lg:hidden">📈</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline sm:hidden lg:inline">Add New</span>
              <span className="xs:hidden lg:hidden">➕</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <div className="order-2 lg:order-1">
                <ExpenseChart expenses={filteredExpenses} />
              </div>
              <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                <ReportsDashboard expenses={filteredExpenses} filterDays={filterDays} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <ExpenseList 
              expenses={expenses}
              onExpenseUpdated={handleExpenseUpdated}
              onExpenseDeleted={handleExpenseDeleted}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <ExpenseChart expenses={filteredExpenses} />
            <ReportsDashboard expenses={filteredExpenses} filterDays={filterDays} />
          </TabsContent>

          <TabsContent value="add" className="space-y-4 sm:space-y-6">
            <div className="max-w-2xl mx-auto">
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}