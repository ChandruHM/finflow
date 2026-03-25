import { z } from 'zod';

export const TransactionStatusEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']);
export const TransactionTypeEnum = z.enum(['CREDIT', 'DEBIT', 'TRANSFER', 'REFUND']);

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  description: z.string(),
  status: TransactionStatusEnum,
  type: TransactionTypeEnum,
  metadata: z.record(z.unknown()).optional(),
  processedByAgent: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTransactionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  description: z.string().min(1, 'Description is required'),
  type: TransactionTypeEnum,
  metadata: z.record(z.unknown()).optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
