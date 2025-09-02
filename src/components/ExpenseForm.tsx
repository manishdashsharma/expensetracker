'use client';

import { useState } from 'react';
import { IExpense } from '@/models/Expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { expenseCategories, incomeCategories, paymentModes, transactionTypes, getCategoryById, getPaymentModeById } from '@/config/expenseConfig';
import { Loader2, IndianRupee, Calendar, CreditCard, FileText, Tag } from 'lucide-react';

interface ExpenseFormProps {
  onExpenseAdded: (expense: IExpense) => void;
  initialData?: Partial<IExpense>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function ExpenseForm({ onExpenseAdded, initialData, onCancel, isEditing = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || '',
    description: initialData?.description || '',
    category: initialData?.category || (initialData?.type === 'credit' ? 'salary' : 'food'),
    type: initialData?.type || 'debit',
    paymentMode: initialData?.paymentMode || 'cash',
    remarks: initialData?.remarks || '',
    date: initialData?.date 
      ? new Date(initialData.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // When transaction type changes, update category to match
      if (field === 'type') {
        if (value === 'credit') {
          newData.category = 'salary'; // Default income category
        } else {
          newData.category = 'food'; // Default expense category
        }
      }
      
      return newData;
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = isEditing ? `/api/expenses/${initialData?._id}` : '/api/expenses';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          category: formData.category,
          type: formData.type,
          paymentMode: formData.paymentMode,
          remarks: formData.remarks.trim(),
          date: new Date(formData.date),
        }),
      });

      if (response.ok) {
        const expense = await response.json();
        onExpenseAdded(expense);
        
        if (!isEditing) {
          // Reset form for new entries
          setFormData({
            amount: '',
            description: '',
            category: 'food',
            type: 'debit',
            paymentMode: 'cash',
            remarks: '',
            date: new Date().toISOString().split('T')[0]
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save transaction');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = getCategoryById(formData.category);
  const selectedPaymentMode = getPaymentModeById(formData.paymentMode);
  const selectedTransactionType = transactionTypes.find(t => t.id === formData.type);

  return (
    <div className="w-full">
      {/* Mobile-First Form Header - Only show for editing */}
      {isEditing && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Edit Transaction</h2>
          </div>
          <p className="text-slate-600 text-base">Update your transaction details</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Type - Mobile Optimized */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Tag className="h-5 w-5" />
              Transaction Type
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            {/* Amount - Full Width on Mobile */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="flex items-center gap-2 text-base font-medium">
                <IndianRupee className="h-5 w-5" />
                Amount
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="h-14 pl-12 text-lg font-medium"
                  required
                />
                <IndianRupee className="absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
              </div>
            </div>

            {/* Date - Full Width on Mobile */}
            <div className="space-y-3">
              <Label htmlFor="date" className="flex items-center gap-2 text-base font-medium">
                <Calendar className="h-5 w-5" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="h-14 text-base"
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Category - Full Width on Mobile */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger className="h-14">
                  <SelectValue>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{selectedCategory?.icon}</span>
                      <span className="text-base">{selectedCategory?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === 'credit' ? incomeCategories : expenseCategories).map((category) => (
                    <SelectItem key={category.id} value={category.id} className="p-4">
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-xl">{category.icon}</span>
                        <span className="flex-1 text-base">{category.label}</span>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode - Full Width on Mobile */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium">
                <CreditCard className="h-5 w-5" />
                Payment Mode
              </Label>
              <Select value={formData.paymentMode} onValueChange={(value) => handleChange('paymentMode', value)}>
                <SelectTrigger className="h-14">
                  <SelectValue>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{selectedPaymentMode?.icon}</span>
                      <span className="text-base">{selectedPaymentMode?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{mode.icon}</span>
                        <span className="text-base">{mode.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="flex items-center gap-2 text-base font-medium">
              <FileText className="h-5 w-5" />
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={formData.type === 'debit' ? 'What did you spend on?' : 'What did you receive money for?'}
              maxLength={200}
              className="h-14 text-base"
              required
            />
          </div>

          {/* Remarks */}
          <div className="space-y-3">
            <Label htmlFor="remarks" className="text-base font-medium">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="Additional notes or comments..."
              maxLength={500}
              rows={4}
              className="text-base resize-none"
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <h4 className="font-semibold mb-3 text-base text-slate-700">Transaction Preview</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium" style={{ color: selectedTransactionType?.color, borderColor: selectedTransactionType?.color }}>
                {selectedTransactionType?.label}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                {selectedCategory?.icon} {selectedCategory?.label}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                {selectedPaymentMode?.icon} {selectedPaymentMode?.label}
              </Badge>
              {formData.amount && (
                <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-green-50 text-green-700 border-green-200">
                  ₹{parseFloat(formData.amount).toLocaleString()}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions - Mobile Optimized */}
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isEditing ? 'Updating Transaction...' : 'Adding Transaction...'}
                </>
              ) : (
                <>
                  <IndianRupee className="mr-2 h-5 w-5" />
                  {isEditing ? 'Update Transaction' : 'Add Transaction'}
                </>
              )}
            </Button>
            
            {(isEditing || onCancel) && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
                className="w-full h-14 text-base font-medium border-2"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
    </div>
  );
}