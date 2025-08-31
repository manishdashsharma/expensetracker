'use client';

import { useMemo } from 'react';
import { IExpense } from '@/models/Expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { expenseCategories, paymentModes, getCategoryById, getPaymentModeById } from '@/config/expenseConfig';
import { TrendingUp, TrendingDown, PieChart, BarChart3, CreditCard, Calendar, Target, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

interface ReportsDashboardProps {
  expenses: IExpense[];
  filterDays: number;
}

export default function ReportsDashboard({ expenses, filterDays }: ReportsDashboardProps) {
  const reports = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);

    // Filter expenses within the selected period
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= cutoffDate && expenseDate <= now;
    });

    // Calculate totals
    const totalIncome = filteredExpenses
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = filteredExpenses
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    // Category-wise breakdown (only expenses)
    const categoryBreakdown = expenseCategories.map(category => {
      const categoryExpenses = filteredExpenses.filter(
        e => e.category === category.id && e.type === 'debit'
      );
      const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const count = categoryExpenses.length;
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      
      return {
        ...category,
        amount,
        count,
        percentage
      };
    }).filter(cat => cat.amount > 0).sort((a, b) => b.amount - a.amount);

    // Payment method breakdown
    const paymentBreakdown = paymentModes.map(mode => {
      const modeExpenses = filteredExpenses.filter(e => e.paymentMode === mode.id);
      const amount = modeExpenses.reduce((sum, e) => sum + e.amount, 0);
      const count = modeExpenses.length;
      const percentage = (totalIncome + totalExpenses) > 0 
        ? (amount / (totalIncome + totalExpenses)) * 100 : 0;
      
      return {
        ...mode,
        amount,
        count,
        percentage
      };
    }).filter(mode => mode.amount > 0).sort((a, b) => b.amount - a.amount);

    // Monthly comparison (current vs previous month)
    const currentMonth = {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
    
    const previousMonth = {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1))
    };

    const currentMonthExpenses = expenses
      .filter(e => e.type === 'debit' && isWithinInterval(new Date(e.date), currentMonth))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const previousMonthExpenses = expenses
      .filter(e => e.type === 'debit' && isWithinInterval(new Date(e.date), previousMonth))
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyChange = previousMonthExpenses > 0 
      ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : 0;

    // Daily average
    const dailyAverage = {
      income: totalIncome / filterDays,
      expenses: totalExpenses / filterDays
    };

    // Top expenses
    const topExpenses = filteredExpenses
      .filter(e => e.type === 'debit')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Recent trends (last 7 days vs previous 7 days)
    const last7Days = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return expenseDate >= sevenDaysAgo;
    });

    const previous7Days = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return expenseDate >= fourteenDaysAgo && expenseDate < sevenDaysAgo;
    });

    const recentTrendExpenses = last7Days
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const previousTrendExpenses = previous7Days
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    const weeklyTrend = previousTrendExpenses > 0 
      ? ((recentTrendExpenses - previousTrendExpenses) / previousTrendExpenses) * 100
      : 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryBreakdown,
      paymentBreakdown,
      monthlyChange,
      dailyAverage,
      topExpenses,
      weeklyTrend,
      transactionCount: filteredExpenses.length,
      currentMonthExpenses,
      previousMonthExpenses
    };
  }, [expenses, filterDays]);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${
                  reports.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(reports.netBalance)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last {filterDays} days
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                reports.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Target className={`h-5 w-5 ${
                  reports.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reports.dailyAverage.expenses)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expense per day
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Trend</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${
                    reports.weeklyTrend <= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(Math.abs(reports.weeklyTrend))}
                  </p>
                  {reports.weeklyTrend <= 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  vs previous week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reports.transactionCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total entries
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Expense by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.categoryBreakdown.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                    <Badge variant="outline">
                      {category.count} transaction{category.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(category.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(category.percentage)}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={category.percentage} 
                  className="h-2"
                  style={{ 
                    '--progress-background': category.color + '20',
                    '--progress-foreground': category.color 
                  } as any}
                />
              </div>
            ))}
            {reports.categoryBreakdown.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No expense categories found for the selected period
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.paymentBreakdown.map((method) => (
              <div key={method.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </div>
                  <Badge variant="outline">
                    {method.count}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(method.amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPercentage(method.percentage)} of total transactions
                </div>
              </div>
            ))}
            {reports.paymentBreakdown.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-4">
                No payment methods found for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Month</span>
                <span className="font-bold">{formatCurrency(reports.currentMonthExpenses)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Previous Month</span>
                <span className="font-bold">{formatCurrency(reports.previousMonthExpenses)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Change</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      reports.monthlyChange <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {reports.monthlyChange > 0 ? '+' : ''}{formatPercentage(reports.monthlyChange)}
                    </span>
                    {reports.monthlyChange <= 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Top Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.topExpenses.map((expense, index) => (
                <div key={expense._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), 'dd MMM')} • 
                        {getCategoryById(expense.category)?.icon} {getCategoryById(expense.category)?.label}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-red-600">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
              {reports.topExpenses.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No expenses found for the selected period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}