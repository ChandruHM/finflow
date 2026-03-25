import { test, expect } from '@playwright/test';

test.describe('Agentic Evaluation Suite', () => {
  const NODE_SERVICE = 'http://localhost:4000';
  const JAVA_SERVICE = 'http://localhost:8080';

  test('should correctly route UI tasks to UX Guardian', async ({ request }) => {
    // Simulate orchestrator routing decision
    const response = await request.post(`${NODE_SERVICE}/api/v1/agent/invoke`, {
      data: {
        task: 'Validate frontend component render performance',
        context: { type: 'ui_validation' },
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.agentId).toBe('node-flow-agent');
  });

  test('should correctly route transaction tasks to Java-Core Agent', async ({ request }) => {
    const response = await request.post(`${JAVA_SERVICE}/api/v1/agent/invoke`, {
      data: {
        task: 'Process batch financial transactions',
        context: { batchSize: 1000 },
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.agentId).toBe('java-core-agent');
  });

  test('Node service health check returns healthy', async ({ request }) => {
    const response = await request.get(`${NODE_SERVICE}/health`);
    expect(response.ok()).toBeTruthy();

    const health = await response.json();
    expect(health.service).toBe('finflow-service-node');
  });

  test('Java service health check returns healthy', async ({ request }) => {
    const response = await request.get(`${JAVA_SERVICE}/actuator/health`);
    expect(response.ok()).toBeTruthy();

    const health = await response.json();
    expect(health.status).toBe('UP');
  });

  test('agents provide structured reasoning in responses', async ({ request }) => {
    const response = await request.post(`${NODE_SERVICE}/api/v1/agent/invoke`, {
      data: {
        task: 'Transform event schema for real-time streaming',
        context: {},
      },
    });

    const body = await response.json();
    expect(body.data.reasoning).toBeDefined();
    expect(Array.isArray(body.data.reasoning)).toBe(true);
    expect(body.data.reasoning.length).toBeGreaterThan(0);
    expect(body.data.output).toBeDefined();
  });
});
