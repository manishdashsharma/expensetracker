'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseChart from '@/components/ExpenseChart';
import ReportsDashboard from '@/components/ReportsDashboard';
import ReportFilters from '@/components/ReportFilters';
import { IExpense } from '@/models/Expense';
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
    <div className="min-h-screen bg-slate-50">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-xl">
                  Finance Tracker
                </h1>
                <p className="text-sm text-slate-600 hidden sm:block">
                  Track your money easily
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium">
                {expenses.length}
              </Badge>
              <ReportFilters filterDays={filterDays} onFilterChange={setFilterDays} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Quick Stats - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-green-800">Total Income</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{totalIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-red-800">Total Expenses</p>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${netBalance >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${netBalance >= 0 ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <p className={`text-sm font-medium ${netBalance >= 0 ? 'text-emerald-800' : 'text-orange-800'}`}>Net Balance</p>
                  </div>
                  <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                    ₹{netBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <List className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-blue-800">Transactions</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {filteredExpenses.length}
                  </p>
                  <p className="text-xs text-blue-600">
                    Last {filterDays} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Add Section - Mobile Optimized */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Quick Add Transaction
            </CardTitle>
            <CardDescription className="text-base text-slate-600 mt-2">
              Tap to quickly record your income or expenses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </CardContent>
        </Card>

        {/* Main Content Tabs - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-white shadow-lg rounded-2xl border-0 p-1">
            <TabsTrigger 
              value="overview" 
              className="flex flex-col items-center gap-1 text-xs font-medium px-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="flex flex-col items-center gap-1 text-xs font-medium px-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <List className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex flex-col items-center gap-1 text-xs font-medium px-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add" 
              className="flex flex-col items-center gap-1 text-xs font-medium px-2 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <div className="order-2 lg:order-1">
                <ExpenseChart expenses={filteredExpenses} />
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <ReportsDashboard expenses={filteredExpenses} filterDays={filterDays} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6 mt-6">
            <ExpenseList 
              expenses={expenses}
              onExpenseUpdated={handleExpenseUpdated}
              onExpenseDeleted={handleExpenseDeleted}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 mt-6">
            <ExpenseChart expenses={filteredExpenses} />
            <ReportsDashboard expenses={filteredExpenses} filterDays={filterDays} />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}