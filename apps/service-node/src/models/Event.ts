import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  type: 'transaction' | 'alert' | 'system' | 'user_action';
  source: string;
  payload: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
  processedBy?: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    type: {
      type: String,
      enum: ['transaction', 'alert', 'system', 'user_action'],
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    processedBy: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'events',
  },
);

// Compound index for efficient queries
EventSchema.index({ type: 1, priority: 1, createdAt: -1 });
EventSchema.index({ status: 1, createdAt: -1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
