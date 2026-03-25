# SpendWise AI Agent Rules

> Industry-standard instructions for AI-powered coding tools (Cursor, Copilot, Windsurf, etc.)
> and for the autonomous agents running within this service.

## Agent Identity

- **Service Role:** SpendWise AI — Intelligent Expense Tracking & Financial Insights
- **Tone:** Professional, financial advisor. Concise, never condescending.
- **Personality:** Helpful but cautious with financial data. Always confirm destructive actions.

---

## Agent Responsibilities

### Node-Flow Agent (This Service)
- **Primary Role:** Natural language processing and MongoDB writes.
- **Capabilities:**
  - Parse natural language expense descriptions into structured data
  - Categorize expenses using LLM-powered classification
  - Save expenses to MongoDB with proper schema validation
  - Manage WebSocket connections for real-time UI updates
  - Handle JSON schema transformations for inter-service communication
- **Model:** GPT-4o / Claude 3.5 Sonnet
- **Location:** `src/agents/orchestrator.ts`, `src/agents/tools.ts`, `src/agents/state.ts`

### Java-Core Agent (Service B — Spring Boot)
- **Primary Role:** All mathematical aggregations and "Audit" tasks.
- **Capabilities:**
  - Scan expense history for spending pattern anomalies
  - Generate financial health warnings (e.g., repeated fast food → "Health Warning")
  - Compute category-level summaries using MongoDB aggregation pipelines
  - Handle BigDecimal precision for financial calculations
  - Multi-threaded batch processing for large record volumes
- **Endpoint:** `POST /api/v1/audit` on the Java service
- **Why Java?** Type safety and superior performance with data streams handling large volumes.

---

## Safety Rules

1. **Never delete expenses without explicit "Double Confirmation."**
   - The `DELETE /api/v1/expenses/:id` endpoint requires header `X-Double-Confirmation: CONFIRMED`
   - The `deleteExpense` tool in `src/agents/tools.ts` requires `confirmationToken: 'CONFIRMED'`
   - Soft-delete is always preferred (set `status: 'deleted'` rather than removing document)

2. **Never modify historical expense amounts** without creating an audit trail.

3. **Never expose raw API keys** in responses or logs.

4. **Always validate amounts are positive** before saving.

5. **Always categorize before saving** — never save an "Uncategorized" expense without trying LLM classification first.

---

## Agentic Workflow — The Flow

```
User Input: "I spent $12 on a burger"
         │
         ▼
┌─────────────────────┐
│   Node-Flow Agent   │  ← Step 1: Parse natural language
│   (Parse + NLP)     │     Extract: $12, "burger"
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Node-Flow Agent   │  ← Step 2: LLM categorization
│   (Categorize)      │     Categorize: "Food & Dining"
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Node-Flow Agent   │  ← Step 3: Save to MongoDB
│   (Save to DB)      │     Write to `expenses` collection
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Java-Core Agent   │  ← Step 4: Audit & Analysis
│   (POST /audit)     │     Check: 5 burgers this week?
│                     │     → "Health Warning" alerts
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Orchestrator      │  ← Step 5: Compose response
│   (Build Response)  │     → Return to UI with insights
└─────────────────────┘
           │
     ┌─────┴─────┐
     │ On Error: │  ← Reflection Loop
     │ Retry ×3  │     Self-correcting pipeline
     └───────────┘
```

---

## File Structure

```
/apps/service-node
├── src/
│   ├── agents/
│   │   ├── orchestrator.ts     # The "Boss" Agent (LangGraph state graph)
│   │   ├── tools.ts           # Functions the AI can call (Java API, DB, NLP)
│   │   └── state.ts           # Defines what the AI "remembers" between steps
│   ├── config/
│   │   └── database.ts        # MongoDB connection with pool management
│   ├── models/
│   │   ├── Expense.ts         # Mongoose Schema — the shared expense document
│   │   └── Event.ts           # System event model for audit trail
│   ├── routes/
│   │   ├── expense.ts         # REST API + /ai endpoint for agentic processing
│   │   ├── agent.ts           # Agent status and invocation endpoints
│   │   ├── events.ts          # System event CRUD
│   │   └── health.ts          # Service health check
│   ├── utils/
│   │   └── logger.ts          # Winston structured logging
│   ├── websocket/
│   │   └── handler.ts         # Socket.IO real-time event broadcasting
│   └── server.ts              # Express server entry point
├── AGENTS.md                  # ← You are here
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Description | Agent |
|--------|----------|-------------|-------|
| `POST` | `/api/v1/expenses/ai` | **Agentic endpoint** — NL input → full pipeline | Node-Flow |
| `GET` | `/api/v1/expenses` | List expenses with filters/pagination | — |
| `GET` | `/api/v1/expenses/summary` | Category aggregation summary | — |
| `GET` | `/api/v1/expenses/:id` | Get single expense | — |
| `DELETE` | `/api/v1/expenses/:id` | Soft-delete (requires Double Confirmation) | — |
| `POST` | `/api/v1/agent/invoke` | Direct agent invocation | Node-Flow |
| `GET` | `/api/v1/agent/status` | Agent health status | — |
| `GET` | `/health` | Service health check | — |

---

## Coding Standards for AI Tools

When generating code for this service:

1. **TypeScript strict mode** — All files use `strict: true`
2. **Zod validation** — All request bodies validated with Zod schemas
3. **Structured logging** — Use `logger.info/warn/error` from `src/utils/logger.ts`
4. **Error boundaries** — Every async route wrapped in try/catch
5. **Financial precision** — Use `number` in Node, `BigDecimal` in Java
6. **Agent attribution** — Always set `processedBy` field when agents modify data
