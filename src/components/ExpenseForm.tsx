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
    <Card className="w-full">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
          {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
        <CardDescription className="text-sm">
          {isEditing ? 'Update your transaction details' : 'Record your income or expense'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Transaction Type
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">({type.description})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
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
                  className="pl-8"
                  required
                />
                <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory?.icon}</span>
                      <span>{selectedCategory?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === 'credit' ? incomeCategories : expenseCategories).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                        <div 
                          className="w-3 h-3 rounded-full ml-auto" 
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Mode
              </Label>
              <Select value={formData.paymentMode} onValueChange={(value) => handleChange('paymentMode', value)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{selectedPaymentMode?.icon}</span>
                      <span>{selectedPaymentMode?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      <div className="flex items-center gap-2">
                        <span>{mode.icon}</span>
                        <span>{mode.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={formData.type === 'debit' ? 'What did you spend on?' : 'What did you receive money for?'}
              maxLength={200}
              required
            />
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="Additional notes or comments..."
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 text-sm sm:text-base">Preview:</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Badge variant="outline" className="text-xs sm:text-sm" style={{ color: selectedTransactionType?.color }}>
                {selectedTransactionType?.label}
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">
                {selectedCategory?.icon} {selectedCategory?.label}
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">
                {selectedPaymentMode?.icon} {selectedPaymentMode?.label}
              </Badge>
              {formData.amount && (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  ₹{parseFloat(formData.amount).toLocaleString()}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 h-11 sm:h-10"
              size="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">{isEditing ? 'Updating...' : 'Adding...'}</span>
                  <span className="sm:hidden">{isEditing ? 'Updating' : 'Adding'}</span>
                </>
              ) : (
                <>
                  <IndianRupee className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{isEditing ? 'Update Transaction' : 'Add Transaction'}</span>
                  <span className="sm:hidden">{isEditing ? 'Update' : 'Add'}</span>
                </>
              )}
            </Button>
            
            {(isEditing || onCancel) && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
                className="h-11 sm:h-10 sm:w-auto"
                size="default"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}