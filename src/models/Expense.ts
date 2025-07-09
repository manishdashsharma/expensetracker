import mongoose from 'mongoose';

export interface IExpense {
  _id?: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
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
      enum: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'],
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