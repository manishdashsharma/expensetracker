import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET() {
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const expense = new Expense({
      amount,
      description,
      category,
      type,
      paymentMode,
      remarks: remarks || '',
      date: new Date(date),
    });

    await expense.save();
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ 
      error: 'Failed to create expense',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}