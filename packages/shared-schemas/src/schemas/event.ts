import { z } from 'zod';

export const EventTypeEnum = z.enum(['transaction', 'alert', 'system', 'user_action']);
export const PriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const EventStatusEnum = z.enum(['pending', 'processed', 'failed']);

export const EventSchema = z.object({
  _id: z.string(),
  type: EventTypeEnum,
  source: z.string(),
  payload: z.record(z.unknown()),
  priority: PriorityEnum,
  metadata: z.record(z.unknown()).optional(),
  processedBy: z.string().optional(),
  status: EventStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateEventSchema = z.object({
  type: EventTypeEnum,
  source: z.string().min(1, 'Source is required'),
  payload: z.record(z.unknown()),
  priority: PriorityEnum.default('medium'),
  metadata: z.record(z.unknown()).optional(),
});

export type Event = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
