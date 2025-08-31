import mongoose from 'mongoose';

export interface IExpense {
  _id?: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'credit' | 'debit'; // Income or Expense
  paymentMode: string;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseSchema = new mongoose.Schema<IExpense>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      maxLength: 200,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['credit', 'debit'],
      default: 'debit'
    },
    paymentMode: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      maxLength: 500,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);