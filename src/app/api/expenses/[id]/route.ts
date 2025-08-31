import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await dbConnect();
    const body = await request.json();
    const { amount, description, category, date, type, paymentMode, remarks } = body;

    if (!amount || !description || !category || !date || !type || !paymentMode) {
      return NextResponse.json({ 
        error: 'Amount, description, category, date, type and payment mode are required' 
      }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const expense = await Expense.findByIdAndUpdate(
      params.id,
      {
        amount,
        description,
        category,
        type,
        paymentMode,
        remarks: remarks || '',
        date: new Date(date),
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ 
      error: 'Failed to update expense',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await dbConnect();
    
    const expense = await Expense.findByIdAndDelete(params.id);
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ 
      error: 'Failed to delete expense',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}