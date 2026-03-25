import { Annotation } from '@langchain/langgraph';

/**
 * Agent State — What the AI "remembers" between steps.
 *
 * This defines the shared state graph for the SpendWise orchestrator.
 * Each key represents a piece of context that agents read from and write to
 * as the conversation flows through the LangGraph pipeline.
 */
export const AgentState = Annotation.Root({
  // ─── User Input ───────────────────────────────────────
  /** Raw natural language input from the user, e.g. "I spent $12 on a burger" */
  userMessage: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),

  /** The userId making the request (from auth / session) */
  userId: Annotation<string>({ reducer: (_, b) => b, default: () => 'default-user' }),

  /** WebSocket session ID for real-time push-back to UI */
  sessionId: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),

  // ─── Parsed Expense Data ──────────────────────────────
  /** Extracted amount from natural language (e.g. 12.00) */
  amount: Annotation<number | null>({ reducer: (_, b) => b, default: () => null }),

  /** LLM-categorized expense category (e.g. "Food", "Transport") */
  category: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),

  /** Cleaned description (e.g. "burger") */
  description: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),

  /** Currency code */
  currency: Annotation<string>({ reducer: (_, b) => b, default: () => 'USD' }),

  // ─── Agent Processing ─────────────────────────────────
  /** Which agent is currently handling the task */
  currentAgent: Annotation<string>({ reducer: (_, b) => b, default: () => 'node-flow-agent' }),

  /** ID of the saved expense document in MongoDB */
  savedExpenseId: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),

  /** Whether the expense was saved successfully */
  saveSuccess: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),

  // ─── Java-Core Agent Audit ────────────────────────────
  /** Whether to trigger a Java audit after saving */
  shouldAudit: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),

  /** Audit results returned from the Java-Core Agent */
  auditResult: Annotation<{
    warnings: string[];
    insights: string[];
    spendingScore: number;
  } | null>({ reducer: (_, b) => b, default: () => null }),

  // ─── Reflection / Error Recovery ──────────────────────
  /** Step-by-step reasoning trace for debugging */
  reasoning: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  /** Error message if something went wrong */
  error: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),

  /** Number of retry attempts in the reflection loop */
  retryCount: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),

  /** Final response message to send back to the user */
  responseMessage: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
});

/** TypeScript type for the full agent state */
export type AgentStateType = typeof AgentState.State;
