import {
  AgentConfig,
  AgentResult,
  OrchestratorState,
  RoutingDecision,
  ReflectionResult,
} from './types';
import { UXGuardianAgent } from './agents/ux-guardian';
import { NodeFlowAgent } from './agents/node-flow';
import { JavaCoreAgent } from './agents/java-core';

/**
 * Multi-Agent Orchestrator
 *
 * Routes tasks to specialized agents, monitors execution,
 * and triggers reflection loops on failure.
 */
export class Orchestrator {
  private agents: Map<string, AgentConfig>;
  private state: OrchestratorState;

  constructor(sessionId: string) {
    this.agents = new Map();
    this.state = {
      sessionId,
      task: '',
      context: {},
      currentAgent: null,
      history: [],
      reflectionLoop: {
        active: false,
        attempts: 0,
        maxAttempts: 3,
        failurePoints: [],
      },
      status: 'idle',
    };

    this.registerAgents();
  }

  private registerAgents(): void {
    const uxGuardian = UXGuardianAgent.getConfig();
    const nodeFlow = NodeFlowAgent.getConfig();
    const javaCore = JavaCoreAgent.getConfig();

    this.agents.set(uxGuardian.id, uxGuardian);
    this.agents.set(nodeFlow.id, nodeFlow);
    this.agents.set(javaCore.id, javaCore);
  }

  /**
   * Route a task to the appropriate agent based on content analysis.
   */
  async routeTask(task: string, context: Record<string, unknown> = {}): Promise<AgentResult> {
    this.state.task = task;
    this.state.context = context;
    this.state.status = 'routing';

    const routing = this.analyzeAndRoute(task);
    console.log(`[Orchestrator] Routing to ${routing.targetAgent} (confidence: ${routing.confidence})`);
    console.log(`[Orchestrator] Reasoning: ${routing.reasoning}`);

    this.state.currentAgent = routing.targetAgent;
    this.state.status = 'executing';

    try {
      const result = await this.executeAgent(routing.targetAgent, task, context);

      if (result.status === 'failed' || result.status === 'requires_fallback') {
        return await this.handleFailure(result, routing);
      }

      this.state.history.push(result);
      this.state.status = 'completed';
      return result;
    } catch (error) {
      const failedResult: AgentResult = {
        agentId: routing.targetAgent,
        task,
        status: 'failed',
        reasoning: [`Execution error: ${(error as Error).message}`],
        output: {},
        confidence: 0,
        processingTimeMs: 0,
        metadata: { model: '', tokensUsed: 0, timestamp: new Date().toISOString() },
      };
      return await this.handleFailure(failedResult, routing);
    }
  }

  /**
   * Analyze task content and determine the best agent.
   */
  private analyzeAndRoute(task: string): RoutingDecision {
    const taskLower = task.toLowerCase();

    // UX Guardian indicators
    const uxKeywords = ['ui', 'frontend', 'component', 'render', 'hydration', 'route', 'page', 'layout', 'css', 'style', 'ux', 'animation'];
    const uxScore = uxKeywords.filter(k => taskLower.includes(k)).length;

    // Node-Flow Agent indicators
    const nodeKeywords = ['event', 'websocket', 'socket', 'stream', 'json', 'schema', 'transform', 'real-time', 'queue', 'notification'];
    const nodeScore = nodeKeywords.filter(k => taskLower.includes(k)).length;

    // Java-Core Agent indicators
    const javaKeywords = ['transaction', 'process', 'batch', 'compute', 'aggregate', 'report', 'financial', 'calculation', 'thread', 'heavy'];
    const javaScore = javaKeywords.filter(k => taskLower.includes(k)).length;

    const scores: Record<string, number> = {
      'ux-guardian': uxScore,
      'node-flow-agent': nodeScore,
      'java-core-agent': javaScore,
    };

    const bestAgent = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
    const totalKeywords = uxScore + nodeScore + javaScore;

    return {
      targetAgent: bestAgent[0],
      confidence: totalKeywords > 0 ? bestAgent[1] / totalKeywords : 0.33,
      reasoning: `Task analysis: UX(${uxScore}) Node(${nodeScore}) Java(${javaScore}). Best match: ${bestAgent[0]}`,
      fallbackAgent: Object.entries(scores).sort(([, a], [, b]) => b - a)[1]?.[0],
    };
  }

  /**
   * Execute the selected agent.
   */
  private async executeAgent(
    agentId: string,
    task: string,
    context: Record<string, unknown>,
  ): Promise<AgentResult> {
    const startTime = Date.now();

    switch (agentId) {
      case 'ux-guardian':
        return UXGuardianAgent.execute(task, context);
      case 'node-flow-agent':
        return NodeFlowAgent.execute(task, context);
      case 'java-core-agent':
        return JavaCoreAgent.execute(task, context);
      default:
        throw new Error(`Unknown agent: ${agentId}`);
    }
  }

  /**
   * Reflection Loop: Analyze failure and attempt corrective action.
   */
  private async handleFailure(
    failedResult: AgentResult,
    routing: RoutingDecision,
  ): Promise<AgentResult> {
    this.state.status = 'reflecting';
    this.state.reflectionLoop.active = true;
    this.state.reflectionLoop.attempts++;
    this.state.reflectionLoop.failurePoints.push(
      `${failedResult.agentId}: ${failedResult.reasoning.join('; ')}`,
    );

    console.log(`[Orchestrator] Reflection Loop activated (attempt ${this.state.reflectionLoop.attempts}/${this.state.reflectionLoop.maxAttempts})`);

    const reflection = this.analyzeFailure(failedResult);
    console.log(`[Orchestrator] Failure analysis: ${reflection.failureAnalysis}`);
    console.log(`[Orchestrator] Corrective action: ${reflection.correctiveAction}`);

    if (
      reflection.shouldRetry &&
      this.state.reflectionLoop.attempts < this.state.reflectionLoop.maxAttempts
    ) {
      const retryAgent = reflection.alternativeAgent || routing.fallbackAgent || routing.targetAgent;
      console.log(`[Orchestrator] Retrying with agent: ${retryAgent}`);

      return this.executeAgent(retryAgent, this.state.task, {
        ...this.state.context,
        _reflection: reflection,
        _previousAttempt: failedResult,
      });
    }

    this.state.status = 'failed';
    return {
      ...failedResult,
      reasoning: [
        ...failedResult.reasoning,
        `Reflection Loop exhausted after ${this.state.reflectionLoop.attempts} attempts`,
        reflection.failureAnalysis,
        reflection.correctiveAction,
      ],
    };
  }

  /**
   * Analyze why an agent failed.
   */
  private analyzeFailure(result: AgentResult): ReflectionResult {
    const isTimeout = result.reasoning.some(r => r.includes('timeout'));
    const isServiceDown = result.reasoning.some(r => r.includes('500') || r.includes('connection'));
    const isDataIssue = result.reasoning.some(r => r.includes('validation') || r.includes('schema'));

    if (isServiceDown) {
      return {
        shouldRetry: true,
        failureAnalysis: `Service ${result.agentId} appears to be down or unresponsive`,
        correctiveAction: 'Route to alternative agent capable of handling the task',
        alternativeAgent: result.agentId === 'node-flow-agent' ? 'java-core-agent' : 'node-flow-agent',
      };
    }

    if (isTimeout) {
      return {
        shouldRetry: true,
        failureAnalysis: `Agent ${result.agentId} timed out during execution`,
        correctiveAction: 'Retry with increased timeout or simplified context',
      };
    }

    if (isDataIssue) {
      return {
        shouldRetry: false,
        failureAnalysis: 'Data validation or schema mismatch detected',
        correctiveAction: 'Review input data format and ensure schema compliance',
      };
    }

    return {
      shouldRetry: this.state.reflectionLoop.attempts < 2,
      failureAnalysis: `Agent ${result.agentId} failed for unknown reason`,
      correctiveAction: 'Escalate to manual review',
    };
  }

  getState(): OrchestratorState {
    return { ...this.state };
  }

  getRegisteredAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }
}
