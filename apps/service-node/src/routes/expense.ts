import { Router, Request, Response } from 'express';
import { processExpenseMessage } from '../agents/orchestrator';
import { Expense } from '../models/Expense';
import { logger } from '../utils/logger';

export const expenseRouter = Router();

// ─────────────────────────────────────────────────────────
// POST /api/v1/expenses/ai
// The primary agentic endpoint — accepts natural language input
// and processes it through the full LangGraph pipeline.
//
// Example:
//   POST /api/v1/expenses/ai
//   { "message": "I spent $12 on a burger", "userId": "user123" }
//
// Flow: Parse(NLP) → Categorize(LLM) → Save(MongoDB) → Audit(Java) → Respond
// ─────────────────────────────────────────────────────────
expenseRouter.post('/ai', async (req: Request, res: Response) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required. Try: "I spent $12 on a burger"',
      });
    }

    logger.info(`[ExpenseRoute] AI processing: "${message}" for user=${userId || 'anonymous'}`);

    const result = await processExpenseMessage({
      userMessage: message,
      userId: userId || 'default-user',
      sessionId,
    });

    // Push real-time update via WebSocket if session exists
    if (sessionId) {
      const io = req.app.get('io');
      if (io) {
        io.to(sessionId).emit('expense:processed', {
          ...result,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const statusCode = result.success ? 201 : 422;
    res.status(statusCode).json(result);
  } catch (error) {
    logger.error('[ExpenseRoute] AI processing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Agent processing failed',
      message: (error as Error).message,
    });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/v1/expenses
// Fetch expenses with pagination and filters
// ─────────────────────────────────────────────────────────
expenseRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      category,
      page = '1',
      limit = '20',
      from,
      to,
    } = req.query;

    const filter: Record<string, unknown> = { status: { $ne: 'deleted' } };
    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (filter.createdAt as Record<string, unknown>).$lte = new Date(to as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('[ExpenseRoute] Failed to fetch expenses:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/v1/expenses/summary
// Aggregation summary by category
// ─────────────────────────────────────────────────────────
expenseRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const matchStage: Record<string, unknown> = { status: 'confirmed' };
    if (userId) matchStage.userId = userId;

    const summary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          lastExpense: { $max: '$createdAt' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('[ExpenseRoute] Summary failed:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/v1/expenses/:id
// Get a single expense
// ─────────────────────────────────────────────────────────
expenseRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id).lean();
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/v1/expenses/:id
// Safety: Requires "Double Confirmation" header per AGENTS.md
// ─────────────────────────────────────────────────────────
expenseRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const confirmationHeader = req.headers['x-double-confirmation'];

    if (confirmationHeader !== 'CONFIRMED') {
      return res.status(403).json({
        success: false,
        error: 'Safety: Deletion requires X-Double-Confirmation: CONFIRMED header',
        hint: 'Per AGENTS.md: "Never delete expenses without explicit Double Confirmation"',
      });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted' },
      { new: true },
    );

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    logger.info(`[ExpenseRoute] Soft-deleted expense: ${req.params.id}`);
    res.json({ success: true, message: 'Expense deleted (soft)', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});
