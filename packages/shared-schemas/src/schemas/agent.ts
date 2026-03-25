import { z } from 'zod';

export const AgentResultSchema = z.object({
  agentId: z.string(),
  task: z.string(),
  status: z.enum(['completed', 'failed', 'requires_fallback']),
  reasoning: z.array(z.string()),
  output: z.record(z.unknown()),
  confidence: z.number().min(0).max(1),
  processingTimeMs: z.number(),
  metadata: z.object({
    model: z.string(),
    tokensUsed: z.number(),
    timestamp: z.string(),
  }),
});

export const OrchestratorResponseSchema = z.object({
  sessionId: z.string(),
  result: AgentResultSchema,
  reflectionLoop: z.object({
    activated: z.boolean(),
    attempts: z.number(),
    failurePoints: z.array(z.string()),
  }),
});

export type AgentResult = z.infer<typeof AgentResultSchema>;
export type OrchestratorResponse = z.infer<typeof OrchestratorResponseSchema>;
