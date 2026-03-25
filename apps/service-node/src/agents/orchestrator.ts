import { StateGraph, END } from '@langchain/langgraph';
import { AgentState, type AgentStateType } from './state';
import {
  parseExpenseFromText,
  saveExpenseToDatabase,
  callJavaAuditAgent,
} from './tools';
import { logger } from '../utils/logger';

/**
 * SpendWise Orchestrator — The "Boss" Agent
 *
 * Built with LangGraph, this orchestrator manages the flow:
 *
 *   User Input → Parse (NLP) → Save (MongoDB) → Audit (Java) → Respond
 *                                                      ↓
 *                                              Reflection Loop
 *                                            (retry on failure)
 *
 * Example flow:
 *   1. User says: "I spent $12 on a burger"
 *   2. Node-Flow Agent parses → { amount: 12, description: "burger", category: "Food & Dining" }
 *   3. Saves to MongoDB → expense doc created
 *   4. Calls Java-Core Agent /audit → checks if 5 burgers this week → "Health Warning"
 *   5. Returns structured response to frontend
 */

// ─────────────────────────────────────────────────────────
// Step 1: Parse Expense (Node-Flow Agent)
// ─────────────────────────────────────────────────────────
async function parseExpenseNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  logger.info(`[Orchestrator:Parse] Processing: "${state.userMessage}"`);

  try {
    const parsed = await parseExpenseFromText(state.userMessage);

    if (!parsed.amount || parsed.amount <= 0) {
      return {
        error: 'Could not extract a valid amount from your message. Try: "I spent $12 on coffee"',
        reasoning: ['❌ Failed to parse amount from user input'],
        responseMessage: 'I couldn\'t understand the amount. Could you try something like "I spent $12 on coffee"?',
      };
    }

    return {
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      currentAgent: 'node-flow-agent',
      reasoning: [
        `✅ Parsed expense: $${parsed.amount}`,
        `📂 Categorized as: ${parsed.category}`,
        `📝 Description: "${parsed.description}"`,
      ],
    };
  } catch (error) {
    return {
      error: `Parse failed: ${(error as Error).message}`,
      reasoning: [`❌ Parse error: ${(error as Error).message}`],
    };
  }
}

// ─────────────────────────────────────────────────────────
// Step 2: Save to MongoDB (Node-Flow Agent)
// ─────────────────────────────────────────────────────────
async function saveExpenseNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (state.error) return {}; // Skip if previous step failed

  logger.info(`[Orchestrator:Save] Persisting $${state.amount} → ${state.category}`);

  const result = await saveExpenseToDatabase({
    userId: state.userId,
    amount: state.amount!,
    category: state.category!,
    description: state.description!,
    currency: state.currency,
  });

  if (!result.success) {
    return {
      saveSuccess: false,
      error: 'Failed to save expense to database',
      reasoning: ['❌ MongoDB write failed — entering reflection loop'],
    };
  }

  return {
    savedExpenseId: result.expenseId,
    saveSuccess: true,
    shouldAudit: true,
    reasoning: [`✅ Saved to MongoDB: ${result.expenseId}`],
  };
}

// ─────────────────────────────────────────────────────────
// Step 3: Call Java-Core Agent for Audit
// ─────────────────────────────────────────────────────────
async function auditExpenseNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (!state.shouldAudit || state.error) return {};

  logger.info(`[Orchestrator:Audit] Triggering Java-Core Agent audit`);

  const auditResult = await callJavaAuditAgent({
    userId: state.userId,
    category: state.category!,
    amount: state.amount!,
  });

  const auditReasoning = [
    `🔍 Java-Core Agent audit complete`,
    `📊 Spending score: ${auditResult.spendingScore}/100`,
  ];
  if (auditResult.warnings.length > 0) {
    auditReasoning.push(`⚠️ Warnings: ${auditResult.warnings.join('; ')}`);
  }

  return {
    auditResult,
    currentAgent: 'java-core-agent',
    reasoning: auditReasoning,
  };
}

// ─────────────────────────────────────────────────────────
// Step 4: Build Final Response
// ─────────────────────────────────────────────────────────
async function buildResponseNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (state.error && !state.saveSuccess) {
    return {
      responseMessage: state.error,
      reasoning: ['📤 Returning error response to user'],
    };
  }

  let message = `✅ Got it! $${state.amount} for "${state.description}" saved under **${state.category}**.`;

  if (state.auditResult) {
    if (state.auditResult.warnings.length > 0) {
      message += `\n\n⚠️ **Spending Alert:**\n${state.auditResult.warnings.map((w) => `- ${w}`).join('\n')}`;
    }
    if (state.auditResult.insights.length > 0) {
      message += `\n\n💡 **Insights:**\n${state.auditResult.insights.map((i) => `- ${i}`).join('\n')}`;
    }
    message += `\n\n📊 Spending Health Score: **${state.auditResult.spendingScore}/100**`;
  }

  return {
    responseMessage: message,
    reasoning: ['📤 Response composed and ready for delivery'],
  };
}

// ─────────────────────────────────────────────────────────
// Step 5: Reflection Loop (Self-Correction)
// ─────────────────────────────────────────────────────────
async function reflectionNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  logger.warn(`[Orchestrator:Reflect] Error detected, attempt ${state.retryCount + 1}/3`);

  return {
    retryCount: state.retryCount + 1,
    error: null, // Clear error for retry
    reasoning: [
      `🔄 Reflection Loop: Attempt ${state.retryCount + 1}/3`,
      `Analyzing failure and retrying...`,
    ],
  };
}

// ─────────────────────────────────────────────────────────
// Routing Logic
// ─────────────────────────────────────────────────────────
function shouldReflect(state: AgentStateType): 'reflect' | 'continue' {
  if (state.error && state.retryCount < 3) {
    return 'reflect';
  }
  return 'continue';
}

function afterSave(state: AgentStateType): 'audit' | 'respond' | 'reflect' {
  if (state.error && state.retryCount < 3) return 'reflect';
  if (state.shouldAudit) return 'audit';
  return 'respond';
}

// ─────────────────────────────────────────────────────────
// Build the LangGraph State Graph
// ─────────────────────────────────────────────────────────
function buildOrchestratorGraph() {
  const graph = new StateGraph(AgentState)
    // Add all nodes
    .addNode('parse', parseExpenseNode)
    .addNode('save', saveExpenseNode)
    .addNode('audit', auditExpenseNode)
    .addNode('respond', buildResponseNode)
    .addNode('reflect', reflectionNode)

    // Define edges
    .addEdge('__start__', 'parse')
    .addConditionalEdges('parse', shouldReflect, {
      reflect: 'reflect',
      continue: 'save',
    })
    .addConditionalEdges('save', afterSave, {
      audit: 'audit',
      respond: 'respond',
      reflect: 'reflect',
    })
    .addEdge('audit', 'respond')
    .addEdge('respond', END)
    .addEdge('reflect', 'parse'); // Retry from parse step

  return graph.compile();
}

// ─────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────
let orchestratorApp: ReturnType<typeof buildOrchestratorGraph> | null = null;

function getOrchestrator() {
  if (!orchestratorApp) {
    orchestratorApp = buildOrchestratorGraph();
  }
  return orchestratorApp;
}

/**
 * Process a natural language expense input through the full agentic pipeline.
 *
 * Flow: Parse → Save → Audit → Respond (with reflection loop on failures)
 */
export async function processExpenseMessage(params: {
  userMessage: string;
  userId: string;
  sessionId?: string;
}): Promise<{
  success: boolean;
  message: string;
  data: {
    amount: number | null;
    category: string | null;
    description: string | null;
    expenseId: string | null;
    auditResult: AgentStateType['auditResult'];
  };
  reasoning: string[];
}> {
  const orchestrator = getOrchestrator();

  logger.info(`[Orchestrator] ─── New request ───`);
  logger.info(`[Orchestrator] User: "${params.userMessage}"`);
  logger.info(`[Orchestrator] UserId: ${params.userId}`);

  const finalState = await orchestrator.invoke({
    userMessage: params.userMessage,
    userId: params.userId,
    sessionId: params.sessionId || '',
  });

  const success = finalState.saveSuccess && !finalState.error;

  logger.info(`[Orchestrator] ─── Complete ── ${success ? '✅' : '❌'}`);
  logger.info(`[Orchestrator] Reasoning trace: ${finalState.reasoning.length} steps`);

  return {
    success,
    message: finalState.responseMessage,
    data: {
      amount: finalState.amount,
      category: finalState.category,
      description: finalState.description,
      expenseId: finalState.savedExpenseId,
      auditResult: finalState.auditResult,
    },
    reasoning: finalState.reasoning,
  };
}

export { getOrchestrator };
