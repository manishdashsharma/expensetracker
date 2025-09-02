export const expenseCategories = [
  // Personal Categories
  { id: 'food', label: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
  { id: 'transportation', label: 'Transportation', color: '#4ECDC4', icon: '🚗' },
  { id: 'shopping', label: 'Shopping', color: '#45B7D1', icon: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', color: '#96CEB4', icon: '🎬' },
  { id: 'bills', label: 'Bills & Utilities', color: '#FECA57', icon: '⚡' },
  { id: 'healthcare', label: 'Healthcare', color: '#FF9FF3', icon: '🏥' },
  { id: 'travel', label: 'Travel', color: '#5F27CD', icon: '✈️' },
  { id: 'groceries', label: 'Groceries', color: '#00D2D3', icon: '🥕' },
  { id: 'fuel', label: 'Fuel', color: '#FF9F43', icon: '⛽' },
  { id: 'investments', label: 'Investments', color: '#FDCB6E', icon: '📈' },
  { id: 'saving', label: 'Saving', color: '#2ECC71', icon: '💎' },
  { id: 'rent', label: 'Rent/Mortgage', color: '#6C5CE7', icon: '🏠' },
  { id: 'other', label: 'Other', color: '#A0A0A0', icon: '📋' }
];

export const incomeCategories = [
  { id: 'salary', label: 'Salary', color: '#26DE81', icon: '💰' },
  { id: 'freelance', label: 'Freelance', color: '#10B981', icon: '💻' },
  { id: 'investment', label: 'Investment Returns', color: '#059669', icon: '📈' },
  { id: 'bonus', label: 'Bonus', color: '#065F46', icon: '🎯' },
  { id: 'other_income', label: 'Other Income', color: '#6B7280', icon: '💵' }
];

export const paymentModes = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳' },
  { id: 'debit_card', label: 'Debit Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'net_banking', label: 'Net Banking', icon: '🏦' },
  { id: 'wallet', label: 'Digital Wallet', icon: '📲' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '💰' },
  { id: 'cheque', label: 'Cheque', icon: '📝' }
];

export const transactionTypes = [
  { id: 'debit', label: 'Expense', color: '#FF6B6B', description: 'Money spent' },
  { id: 'credit', label: 'Income', color: '#26DE81', description: 'Money received' }
];

export const reportPeriods = [
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: 'Last 30 days' },
  { id: '90', label: 'Last 3 months' },
  { id: '365', label: 'Last year' },
  { id: 'custom', label: 'Custom range' }
];

export const getCategoryById = (id: string) => {
  return expenseCategories.find(cat => cat.id === id) || 
         incomeCategories.find(cat => cat.id === id) || 
         expenseCategories.find(cat => cat.id === 'other');
};

export const getIncomeCategoryById = (id: string) => {
  return incomeCategories.find(cat => cat.id === id) || incomeCategories.find(cat => cat.id === 'other_income');
};

export const getPaymentModeById = (id: string) => {
  return paymentModes.find(mode => mode.id === id) || paymentModes[0];
};