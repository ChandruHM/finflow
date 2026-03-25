import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Event, IEvent } from '../models/Event';
import { logger } from '../utils/logger';

export const eventsRouter = Router();

// ─── Validation Schemas ─────────────────────────────────
const CreateEventSchema = z.object({
  type: z.enum(['transaction', 'alert', 'system', 'user_action']),
  source: z.string().min(1),
  payload: z.record(z.unknown()),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  metadata: z.record(z.unknown()).optional(),
});

const QueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.string().optional(),
  priority: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

// ─── GET /api/v1/events ─────────────────────────────────
eventsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const params = QueryParamsSchema.parse(req.query);
    const filter: Record<string, unknown> = {};

    if (params.type) filter.type = params.type;
    if (params.priority) filter.priority = params.priority;
    if (params.from || params.to) {
      filter.createdAt = {};
      if (params.from) (filter.createdAt as Record<string, unknown>).$gte = new Date(params.from);
      if (params.to) (filter.createdAt as Record<string, unknown>).$lte = new Date(params.to);
    }

    const skip = (params.page - 1) * params.limit;
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch events:', error);
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// ─── POST /api/v1/events ────────────────────────────────
eventsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = CreateEventSchema.parse(req.body);
    const event = await Event.create(body);
    logger.info(`Event created: ${event._id} [${event.type}]`);

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    logger.error('Failed to create event:', error);
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// ─── GET /api/v1/events/:id ─────────────────────────────
eventsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    logger.error('Failed to fetch event:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ─── GET /api/v1/events/aggregate/summary ───────────────
eventsRouter.get('/aggregate/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await Event.aggregate([
      {
        $group: {
          _id: { type: '$type', priority: '$priority' },
          count: { $sum: 1 },
          latestEvent: { $max: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$_id.type',
          priorities: {
            $push: {
              priority: '$_id.priority',
              count: '$count',
              latestEvent: '$latestEvent',
            },
          },
          totalCount: { $sum: '$count' },
        },
      },
      { $sort: { totalCount: -1 } },
    ]);

    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Failed to aggregate events:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});
