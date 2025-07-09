import mongoose from 'mongoose';

export interface IGoal {
  _id?: string;
  bankAmount: number;
  startDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const GoalSchema = new mongoose.Schema<IGoal>(
  {
    bankAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);