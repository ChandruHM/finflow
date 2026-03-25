import { Expense } from '../models/Expense';
import { logger } from '../utils/logger';
import type { AgentStateType } from './state';

const JAVA_SERVICE_URL = process.env.JAVA_SERVICE_URL || 'http://localhost:8080';

/**
 * Tools — Functions the AI agents can call.
 *
 * These are the "hands" of the agentic system. The LLM decides WHICH
 * tool to call and with WHAT parameters. Each tool performs a side-effect
 * (DB write, API call) and returns structured data back into the state.
 */

// ─────────────────────────────────────────────────────────
// Tool 1: Parse Expense from Natural Language
// ─────────────────────────────────────────────────────────
/**
 * Uses pattern matching + LLM fallback to extract structured expense
 * data from a natural language string like "I spent $12 on a burger."
 *
 * In production, this would call OpenAI/Claude to handle ambiguous inputs.
 * For demo purposes, it uses regex extraction with smart defaults.
 */
export async function parseExpenseFromText(
  userMessage: string,
): Promise<{ amount: number; description: string; category: string }> {
  logger.info(`[Tool:ParseExpense] Parsing: "${userMessage}"`);

  // Extract dollar amount — handles "$12", "$12.50", "12 dollars"
  const amountMatch = userMessage.match(/\$?([\d,]+\.?\d*)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;

  // Extract description — everything after price-related words
  const descMatch = userMessage.match(
    /(?:on|for|at|buying|bought|got|ordered)\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\.|$)/i,
  );
  const description = descMatch ? descMatch[1].trim() : userMessage;

  // LLM-powered categorization (simulated with keyword matching for demo)
  const category = categorizeExpense(description);

  logger.info(`[Tool:ParseExpense] Result: $${amount} | "${description}" | ${category}`);
  return { amount, description, category };
}

/**
 * Categorization engine — In production this is an LLM call.
 * For the demo, uses a keyword dictionary that showcases the concept.
 */
function categorizeExpense(description: string): string {
  const desc = description.toLowerCase();

  const categories: Record<string, string[]> = {
    'Food & Dining': [
      'burger', 'pizza', 'coffee', 'lunch', 'dinner', 'breakfast',
      'restaurant', 'food', 'meal', 'snack', 'drink', 'sushi',
      'sandwich', 'salad', 'starbucks', 'mcdonalds', 'uber eats',
      'doordash', 'grubhub', 'takeout', 'delivery',
    ],
    'Transportation': [
      'uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'toll',
      'bus', 'train', 'metro', 'subway', 'flight', 'airline',
    ],
    'Shopping': [
      'amazon', 'clothes', 'shoes', 'shirt', 'jacket', 'pants',
      'electronics', 'phone', 'laptop', 'gadget', 'gift',
    ],
    'Entertainment': [
      'movie', 'netflix', 'spotify', 'concert', 'game', 'gaming',
      'theater', 'show', 'ticket', 'subscription',
    ],
    'Health & Fitness': [
      'gym', 'doctor', 'medicine', 'pharmacy', 'wellness',
      'yoga', 'workout', 'supplement', 'vitamin',
    ],
    'Bills & Utilities': [
      'rent', 'electric', 'water', 'internet', 'wifi', 'phone bill',
      'insurance', 'mortgage', 'utility',
    ],
    'Education': [
      'book', 'course', 'udemy', 'tutorial', 'class', 'school',
      'university', 'tuition', 'study',
    ],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => desc.includes(kw))) {
      return category;
    }
  }

  return 'Miscellaneous';
}

// ─────────────────────────────────────────────────────────
// Tool 2: Save Expense to MongoDB
// ─────────────────────────────────────────────────────────
/**
 * Persists the categorized expense to MongoDB. This is the "write" action
 * that the Node-Flow Agent performs after parsing the user's input.
 */
export async function saveExpenseToDatabase(params: {
  userId: string;
  amount: number;
  category: string;
  description: string;
  currency: string;
}): Promise<{ expenseId: string; success: boolean }> {
  logger.info(`[Tool:SaveExpense] Saving: $${params.amount} "${params.description}" → ${params.category}`);

  try {
    const expense = await Expense.create({
      userId: params.userId,
      amount: params.amount,
      category: params.category,
      description: params.description,
      currency: params.currency,
      source: 'ai-agent',
      processedBy: 'node-flow-agent',
      status: 'confirmed',
    });

    logger.info(`[Tool:SaveExpense] ✅ Saved expense: ${expense._id}`);
    return { expenseId: expense._id.toString(), success: true };
  } catch (error) {
    logger.error(`[Tool:SaveExpense] ❌ Failed:`, error);
    return { expenseId: '', success: false };
  }
}

// ─────────────────────────────────────────────────────────
// Tool 3: Call Java-Core Agent for Audit
// ─────────────────────────────────────────────────────────
/**
 * Calls the Java Spring Boot /audit endpoint. The Java-Core Agent scans
 * the user's expense history and generates spending insights & warnings.
 *
 * WHY JAVA? → Type safety with BigDecimal for financial precision,
 * and superior throughput for aggregation over large volumes of records
 * using Spring's thread pool executor.
 */
export async function callJavaAuditAgent(params: {
  userId: string;
  category: string;
  amount: number;
}): Promise<{
  warnings: string[];
  insights: string[];
  spendingScore: number;
}> {
  logger.info(`[Tool:JavaAudit] Calling Java-Core Agent audit for user=${params.userId}, category=${params.category}`);

  try {
    const response = await fetch(`${JAVA_SERVICE_URL}/api/v1/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: params.userId,
        category: params.category,
        latestAmount: params.amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Java service responded with ${response.status}`);
    }

    const result = await response.json();
    logger.info(`[Tool:JavaAudit] ✅ Audit complete — ${result.data.warnings.length} warnings`);
    return result.data;
  } catch (error) {
    logger.warn(`[Tool:JavaAudit] ⚠️ Java service unavailable, using fallback audit`);

    // Fallback: Local audit when Java service is down
    return {
      warnings: params.amount > 50
        ? [`High single-expense alert: $${params.amount} on ${params.category}`]
        : [],
      insights: [
        `Expense of $${params.amount} recorded in ${params.category}`,
        'Java-Core Agent will perform deep analysis when available',
      ],
      spendingScore: 75,
    };
  }
}

// ─────────────────────────────────────────────────────────
// Tool 4: Delete Expense (with Double Confirmation guard)
// ─────────────────────────────────────────────────────────
/**
 * Safety rule from AGENTS.md: "Never delete expenses without Double Confirmation."
 * This tool requires an explicit confirmation token to proceed.
 */
export async function deleteExpense(params: {
  expenseId: string;
  confirmationToken: string;
}): Promise<{ deleted: boolean; message: string }> {
  logger.info(`[Tool:DeleteExpense] Request to delete: ${params.expenseId}`);

  // Double Confirmation check
  if (params.confirmationToken !== 'CONFIRMED') {
    logger.warn(`[Tool:DeleteExpense] ❌ Rejected — missing double confirmation`);
    return {
      deleted: false,
      message: 'Safety: Deletion requires explicit "Double Confirmation" per AGENTS.md rules.',
    };
  }

  try {
    const result = await Expense.findByIdAndDelete(params.expenseId);
    if (!result) {
      return { deleted: false, message: 'Expense not found' };
    }
    logger.info(`[Tool:DeleteExpense] ✅ Deleted: ${params.expenseId}`);
    return { deleted: true, message: `Expense ${params.expenseId} permanently removed` };
  } catch (error) {
    logger.error(`[Tool:DeleteExpense] ❌ Failed:`, error);
    return { deleted: false, message: 'Deletion failed' };
  }
}
