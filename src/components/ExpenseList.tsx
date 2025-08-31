'use client';

import { useState } from 'react';
import { IExpense } from '@/models/Expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { expenseCategories, paymentModes, getCategoryById, getPaymentModeById } from '@/config/expenseConfig';
import { Edit, Trash2, MoreHorizontal, Search, Filter, Calendar, IndianRupee, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import ExpenseForm from './ExpenseForm';

interface ExpenseListProps {
  expenses: IExpense[];
  onExpenseUpdated: (expense: IExpense) => void;
  onExpenseDeleted: (expenseId: string) => void;
}

type SortField = 'date' | 'amount' | 'description' | 'category';
type SortDirection = 'asc' | 'desc';

export default function ExpenseList({ expenses, onExpenseUpdated, onExpenseDeleted }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<IExpense | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter expenses based on search and filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || expense.category === selectedCategory;
    const matchesType = selectedType === '' || expense.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'amount') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDelete = async (expense: IExpense) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/expenses/${expense._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onExpenseDeleted(expense._id!);
        setDeletingExpense(null);
      } else {
        setError('Failed to delete transaction');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseUpdated = (updatedExpense: IExpense) => {
    onExpenseUpdated(updatedExpense);
    setEditingExpense(null);
  };

  const getTotalIncome = () => {
    return sortedExpenses
      .filter(expense => expense.type === 'credit')
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalExpenses = () => {
    return sortedExpenses
      .filter(expense => expense.type === 'debit')
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Income</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                  ₹{getTotalIncome().toLocaleString()}
                </p>
              </div>
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Expenses</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                  ₹{getTotalExpenses().toLocaleString()}
                </p>
              </div>
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Net Balance</p>
                <p className={`text-lg sm:text-2xl font-bold truncate ${
                  getTotalIncome() - getTotalExpenses() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{(getTotalIncome() - getTotalExpenses()).toLocaleString()}
                </p>
              </div>
              <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                getTotalIncome() - getTotalExpenses() >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <IndianRupee className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  getTotalIncome() - getTotalExpenses() >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Types</option>
              <option value="credit">Income</option>
              <option value="debit">Expense</option>
            </select>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedType('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-lg sm:text-xl">Transactions ({sortedExpenses.length})</span>
            <Badge variant="outline" className="self-start sm:self-auto text-xs">
              {sortedExpenses.length} of {expenses.length} transactions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Mobile Card View */}
          <div className="space-y-3 sm:hidden">
            {sortedExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found matching your criteria
              </div>
            ) : (
              sortedExpenses.map((expense) => {
                const category = getCategoryById(expense.category);
                const paymentMode = getPaymentModeById(expense.paymentMode);
                
                return (
                  <Card key={expense._id} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{expense.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`font-bold text-sm ${
                          expense.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {expense.type === 'credit' ? '+' : '-'}₹{expense.amount.toLocaleString()}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingExpense(expense)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs" style={{ borderColor: category?.color }}>
                        {category?.icon} {category?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {paymentMode?.icon} {paymentMode?.label}
                      </Badge>
                    </div>
                    
                    {expense.remarks && (
                      <div className="text-xs text-muted-foreground mt-2 truncate">
                        {expense.remarks}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Category
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <IndianRupee className="h-4 w-4" />
                      Amount
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedExpenses.map((expense) => {
                    const category = getCategoryById(expense.category);
                    const paymentMode = getPaymentModeById(expense.paymentMode);
                    
                    return (
                      <TableRow key={expense._id}>
                        <TableCell className="font-medium">
                          {format(new Date(expense.date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{expense.description}</div>
                            {expense.remarks && (
                              <div className="text-sm text-muted-foreground">
                                {expense.remarks}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{ borderColor: category?.color }}>
                            {category?.icon} {category?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {paymentMode?.icon} {paymentMode?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            expense.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {expense.type === 'credit' ? '+' : '-'}₹{expense.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingExpense(expense)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingExpense && (
            <ExpenseForm
              initialData={editingExpense}
              onExpenseAdded={handleExpenseUpdated}
              onCancel={() => setEditingExpense(null)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingExpense} onOpenChange={() => setDeletingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingExpense && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">{deletingExpense.description}</div>
                <div className="text-sm text-muted-foreground">
                  ₹{deletingExpense.amount.toLocaleString()} • {format(new Date(deletingExpense.date), 'dd MMM yyyy')}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDeletingExpense(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deletingExpense && handleDelete(deletingExpense)}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}