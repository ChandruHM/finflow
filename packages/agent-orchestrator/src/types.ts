export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  serviceUrl: string;
  model: string;
  maxRetries: number;
  timeoutMs: number;
}

export interface AgentResult {
  agentId: string;
  task: string;
  status: 'completed' | 'failed' | 'requires_fallback';
  reasoning: string[];
  output: Record<string, unknown>;
  confidence: number;
  processingTimeMs: number;
  metadata: {
    model: string;
    tokensUsed: number;
    timestamp: string;
  };
}

export interface OrchestratorState {
  sessionId: string;
  task: string;
  context: Record<string, unknown>;
  currentAgent: string | null;
  history: AgentResult[];
  reflectionLoop: {
    active: boolean;
    attempts: number;
    maxAttempts: number;
    failurePoints: string[];
  };
  status: 'idle' | 'routing' | 'executing' | 'reflecting' | 'completed' | 'failed';
}

export interface RoutingDecision {
  targetAgent: string;
  confidence: number;
  reasoning: string;
  fallbackAgent?: string;
}

export interface ReflectionResult {
  shouldRetry: boolean;
  failureAnalysis: string;
  correctiveAction: string;
  alternativeAgent?: string;
}
