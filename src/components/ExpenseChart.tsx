'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { IExpense } from '@/models/Expense';
import { format, startOfDay, eachDayOfInterval, subDays } from 'date-fns';

const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"
    />
  </div>
});

interface ExpenseChartProps {
  expenses: IExpense[];
}

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [chartData, setChartData] = useState<any>({
    series: [],
    options: {},
  });
  const [activeTab, setActiveTab] = useState<'daily' | 'category'>('daily');

  useEffect(() => {
    if (activeTab === 'daily') {
      generateDailyChart();
    } else {
      generateCategoryChart();
    }
  }, [expenses, activeTab]);

  const generateDailyChart = () => {
    const today = new Date();
    const startDate = subDays(today, 6);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    const dailyExpenses = dateRange.map(date => {
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = startOfDay(new Date(expense.date));
        return expenseDate.getTime() === startOfDay(date).getTime();
      });
      
      return {
        date: format(date, 'MMM dd'),
        amount: dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      };
    });

    setChartData({
      series: [{
        name: 'Daily Expenses',
        data: dailyExpenses.map(d => d.amount)
      }],
      options: {
        chart: {
          type: 'line',
          height: 350,
          background: 'transparent',
          toolbar: {
            show: false
          }
        },
        theme: {
          mode: 'dark'
        },
        colors: ['#22c55e'],
        xaxis: {
          categories: dailyExpenses.map(d => d.date),
          labels: {
            style: {
              colors: '#d1d5db'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: '#d1d5db'
            },
            formatter: (val: number) => `₹${val.toFixed(2)}`
          }
        },
        grid: {
          borderColor: '#1f2937',
          strokeDashArray: 4
        },
        stroke: {
          curve: 'smooth',
          width: 4
        },
        markers: {
          size: 8,
          colors: ['#22c55e'],
          strokeColors: '#000000',
          strokeWidth: 2
        },
        tooltip: {
          theme: 'dark',
          style: {
            backgroundColor: '#111827',
            color: '#ffffff'
          },
          y: {
            formatter: (val: number) => `₹${val.toFixed(2)}`
          }
        }
      }
    });
  };

  const generateCategoryChart = () => {
    const categoryData = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);

    setChartData({
      series: amounts,
      options: {
        chart: {
          type: 'donut',
          height: 350,
          background: 'transparent'
        },
        theme: {
          mode: 'dark'
        },
        colors: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#10b981', '#059669', '#047857'],
        labels: categories,
        legend: {
          labels: {
            colors: '#d1d5db'
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '16px',
                  color: '#d1d5db'
                },
                value: {
                  show: true,
                  fontSize: '20px',
                  color: '#22c55e',
                  formatter: (val: string) => `₹${parseFloat(val).toFixed(2)}`
                },
                total: {
                  show: true,
                  label: 'Total',
                  color: '#d1d5db',
                  formatter: () => `₹${amounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)}`
                }
              }
            }
          }
        },
        tooltip: {
          theme: 'dark',
          style: {
            backgroundColor: '#111827',
            color: '#ffffff'
          },
          y: {
            formatter: (val: number) => `₹${val.toFixed(2)}`
          }
        }
      }
    });
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex space-x-4 mb-6">
        <motion.button
          onClick={() => setActiveTab('daily')}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/30'
          }`}
        >
          Daily Trend
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('category')}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'category'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/30'
          }`}
        >
          By Category
        </motion.button>
      </div>
      
      <motion.div 
        className="h-96"
        key={activeTab}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Chart
          options={chartData.options}
          series={chartData.series}
          type={activeTab === 'daily' ? 'line' : 'donut'}
          height={350}
        />
      </motion.div>
    </motion.div>
  );
}