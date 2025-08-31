'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { IExpense } from '@/models/Expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { expenseCategories, getCategoryById } from '@/config/expenseConfig';
import { format, startOfDay, eachDayOfInterval, subDays } from 'date-fns';
import { BarChart3, PieChart, TrendingUp, Loader2 } from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-muted-foreground">Loading charts...</span>
      </div>
    </div>
  )
});

interface ExpenseChartProps {
  expenses: IExpense[];
}

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [dailyChartData, setDailyChartData] = useState<any>({ series: [], options: {} });
  const [categoryChartData, setCategoryChartData] = useState<any>({ series: [], options: {} });
  const [monthlyChartData, setMonthlyChartData] = useState<any>({ series: [], options: {} });

  useEffect(() => {
    generateCharts();
  }, [expenses]);

  const generateCharts = () => {
    generateDailyChart();
    generateCategoryChart();
    generateMonthlyChart();
  };

  const generateDailyChart = () => {
    const today = new Date();
    const startDate = subDays(today, 13); // Last 14 days
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    const dailyData = dateRange.map(date => {
      const dayTransactions = expenses.filter(transaction => {
        const transactionDate = startOfDay(new Date(transaction.date));
        return transactionDate.getTime() === startOfDay(date).getTime();
      });
      
      const income = dayTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenseAmount = dayTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(date, 'MMM dd'),
        income,
        expenses: expenseAmount
      };
    });

    setDailyChartData({
      series: [
        {
          name: 'Income',
          data: dailyData.map(d => d.income),
          color: '#10b981'
        },
        {
          name: 'Expenses', 
          data: dailyData.map(d => d.expenses),
          color: '#ef4444'
        }
      ],
      options: {
        chart: {
          type: 'line',
          height: 350,
          background: 'transparent',
          toolbar: { show: false },
          animations: { enabled: true }
        },
        colors: ['#10b981', '#ef4444'],
        dataLabels: { enabled: false },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 5,
          strokeWidth: 2,
          strokeColors: ['#10b981', '#ef4444'],
          fillColors: ['#10b981', '#ef4444']
        },
        xaxis: {
          categories: dailyData.map(d => d.date),
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          }
        },
        yaxis: {
          labels: {
            style: { colors: '#64748b' },
            formatter: (val: number) => `₹${val.toLocaleString()}`
          }
        },
        grid: {
          borderColor: '#e2e8f0',
          strokeDashArray: 2
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          labels: { colors: '#64748b' }
        },
        tooltip: {
          theme: 'light',
          y: {
            formatter: (val: number) => `₹${val.toLocaleString()}`
          }
        }
      }
    });
  };

  const generateCategoryChart = () => {
    // Only show expenses in category chart
    const expensesByCategory = expenses
      .filter(e => e.type === 'debit')
      .reduce((acc, transaction) => {
        const category = getCategoryById(transaction.category);
        const categoryName = category?.label || 'Other';
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    // Generate colors based on category config
    const colors = categories.map(categoryName => {
      const category = expenseCategories.find(c => c.label === categoryName);
      return category?.color || '#64748b';
    });

    setCategoryChartData({
      series: amounts,
      options: {
        chart: {
          type: 'donut',
          height: 350,
          background: 'transparent'
        },
        colors,
        labels: categories,
        legend: {
          position: 'bottom',
          labels: { colors: '#64748b' }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '14px',
                  color: '#64748b'
                },
                value: {
                  show: true,
                  fontSize: '16px',
                  color: '#1e293b',
                  formatter: (val: string) => `₹${parseFloat(val).toLocaleString()}`
                },
                total: {
                  show: true,
                  label: 'Total Expenses',
                  color: '#64748b',
                  fontSize: '12px',
                  formatter: () => `₹${amounts.reduce((sum, amount) => sum + amount, 0).toLocaleString()}`
                }
              }
            }
          }
        },
        tooltip: {
          theme: 'light',
          y: {
            formatter: (val: number) => `₹${val.toLocaleString()}`
          }
        }
      }
    });
  };

  const generateMonthlyChart = () => {
    // Group by month for income vs expenses
    const monthlyData = expenses.reduce((acc, transaction) => {
      const month = format(new Date(transaction.date), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'credit') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expenses += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expenses);

    setMonthlyChartData({
      series: [
        {
          name: 'Income',
          data: incomeData,
          color: '#10b981'
        },
        {
          name: 'Expenses',
          data: expenseData,
          color: '#ef4444'
        }
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          background: 'transparent',
          toolbar: { show: false }
        },
        colors: ['#10b981', '#ef4444'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            borderRadius: 4
          }
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: months,
          labels: {
            style: { colors: '#64748b', fontSize: '12px' }
          }
        },
        yaxis: {
          labels: {
            style: { colors: '#64748b' },
            formatter: (val: number) => `₹${val.toLocaleString()}`
          }
        },
        grid: {
          borderColor: '#e2e8f0',
          strokeDashArray: 2
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          labels: { colors: '#64748b' }
        },
        tooltip: {
          theme: 'light',
          y: {
            formatter: (val: number) => `₹${val.toLocaleString()}`
          }
        }
      }
    });
  };

  if (!expenses.length) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="text-muted-foreground mb-2">
            <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
          </div>
          <h3 className="font-medium mb-1 text-sm sm:text-base">No transaction data</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Add some transactions to see your financial insights and trends
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
          <TabsTrigger value="daily" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Daily</span>
            <span className="xs:hidden">📈</span>
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Category</span>
            <span className="xs:hidden">🥧</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Monthly</span>
            <span className="xs:hidden">📊</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-lg sm:text-xl">Daily Income vs Expenses</span>
                <Badge variant="outline" className="self-start sm:self-auto text-xs">Last 14 days</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full">
                <Chart
                  options={dailyChartData.options}
                  series={dailyChartData.series}
                  type="line"
                  height={280}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-lg sm:text-xl">Expenses by Category</span>
                <Badge variant="outline" className="self-start sm:self-auto text-xs">Current period</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full">
                <Chart
                  options={categoryChartData.options}
                  series={categoryChartData.series}
                  type="donut"
                  height={280}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-lg sm:text-xl">Monthly Income vs Expenses</span>
                <Badge variant="outline" className="self-start sm:self-auto text-xs">All months</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full">
                <Chart
                  options={monthlyChartData.options}
                  series={monthlyChartData.series}
                  type="bar"
                  height={280}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}