import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  userId: string;
  amount: number;
  category: string;
  description: string;
  currency: string;
  source: 'manual' | 'ai-agent' | 'import';
  processedBy: string;
  status: 'pending' | 'confirmed' | 'disputed' | 'deleted';
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    source: {
      type: String,
      enum: ['manual', 'ai-agent', 'import'],
      default: 'ai-agent',
    },
    processedBy: {
      type: String,
      default: 'node-flow-agent',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'disputed', 'deleted'],
      default: 'confirmed',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'expenses',
  },
);

// Compound indexes for efficient queries from both Node & Java services
ExpenseSchema.index({ userId: 1, category: 1, createdAt: -1 });
ExpenseSchema.index({ userId: 1, createdAt: -1 });
ExpenseSchema.index({ category: 1, amount: -1 });
ExpenseSchema.index({ status: 1, createdAt: -1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
