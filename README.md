# Multi-Agent Enterprise Stack: Autonomous Microservices

A production-grade reference architecture demonstrating a **multi-agent orchestration layer** managing a polyglot microservices ecosystem. This project showcases the integration of **Next.js**, **Node.js**, and **Java (Spring Boot)**, unified by a self-correcting agentic workflow.

## 🏗 Architecture Overview

The system is designed as a **Monorepo** to facilitate cross-service agentic reasoning.

* **Frontend (Next.js 15+):** Server-side rendered UI with streaming AI responses via Vercel AI SDK.
* **Service A (Node.js/Express):** High-concurrency event handling and real-time state management.
* **Service B (Java/Spring Boot):** Robust data processing, multi-threading, and enterprise business logic.
* **Database (MongoDB Atlas):** Unified document store with optimized aggregation pipelines.

---

## 🤖 The Multi-Agent Orchestration Layer

Unlike standard "Chat-with-PDF" apps, this system utilizes **three specialized autonomous agents** built on **LangGraph (Node.js)** to maintain system integrity.

| Agent | Responsibility | Capabilities |
| :--- | :--- | :--- |
| **UX Guardian** | Frontend State & UX | Validates Next.js route integrity, manages hydration states, and monitors UI performance. |
| **Node-Flow Agent** | Backend (Node.js) Logic | Handles dynamic JSON schema transformations and manages WebSocket connections. |
| **Java-Core Agent** | Backend (Java) Integrity | Oversees complex MongoDB transactions, JPA mappings, and heavy computational tasks. |

> **Agentic Workflow:** When a request fails, the **Orchestrator** triggers a **Reflection Loop**. The responsible agent analyzes the logs, identifies the failure point (e.g., a 500 error in the Java service), and suggests a corrective action or provides a detailed technical fallback.

---

## 🛠 Tech Stack

* **Languages:** TypeScript (ES6+), Java 21, HTML5/SCSS
* **Frameworks:** Next.js (App Router), Express.js, Spring Boot
* **Database:** MongoDB (Atlas)
* **AI/LLM:** LangChain, LangGraph, OpenAI GPT-4o / Claude 3.5 Sonnet
* **Testing:** **Playwright** (E2E), **Jest** (Unit Testing)
* **DevOps:** Docker, GitHub Actions, Jenkins

---

## 🚀 Deployment (Free Tier Strategy)

This project is configured for zero-cost deployment to serve as a live public reference:

* **Frontend:** [Vercel](https://vercel.com) (Automatic deployments from `/apps/frontend`)
* **Node.js Service:** [Render](https://render.com) (Free Tier Web Service)
* **Java Service:** [Oracle Cloud](https://www.oracle.com/cloud/free/) (Always Free ARM Instance)
* **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 Free Cluster)

---

## 📂 Project Structure

```text
├── apps/
│   ├── frontend/             # Next.js App
│   ├── service-node/         # Express + Node Agent logic
│   └── service-java/         # Spring Boot + Java Agent logic
├── packages/
│   ├── agent-orchestrator/   # Shared LangGraph logic & Multi-agent configs
│   └── shared-schemas/       # Shared TypeScript/Zod & Java DTOs
├── tests/
│   └── playwright/           # Cross-service E2E AI verification
├── .github/
│   └── workflows/            # CI/CD pipeline definitions
├── Jenkinsfile               # Jenkins pipeline for Java service
└── docker-compose.yml        # Local development environment
```

---

## 🚦 Getting Started

### Prerequisites

* **Node.js** >= 20.x
* **Java** >= 21
* **Docker** & **Docker Compose**
* **MongoDB** (local or Atlas connection string)

### 1. Clone the Repo

```bash
git clone https://github.com/ChandruHM/finflow.git
cd finflow
```

### 2. Environment Setup

Create a `.env` file in each service using the provided `.env.example`:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/service-node/.env.example apps/service-node/.env
cp apps/service-java/.env.example apps/service-java/.env
```

### 3. Local Run (Docker)

```bash
docker-compose up --build
```

This will start:
- **Frontend** at `http://localhost:3000`
- **Node Service** at `http://localhost:4000`
- **Java Service** at `http://localhost:8080`
- **MongoDB** at `mongodb://localhost:27017`

### 4. Local Run (Without Docker)

```bash
# Terminal 1 — Frontend
cd apps/frontend && npm install && npm run dev

# Terminal 2 — Node Service
cd apps/service-node && npm install && npm run dev

# Terminal 3 — Java Service
cd apps/service-java && ./mvnw spring-boot:run
```

### 5. Run E2E Tests

```bash
npx playwright test
```

---

## 📈 Testing & QA

We utilize **Playwright** not just for UI testing, but for **Agentic Evaluation**. Our test suite verifies that agents correctly identify and route tasks between the Node and Java backends, ensuring 99% reliability in non-deterministic LLM responses.

### Test Strategy

| Layer | Tool | Scope |
| :--- | :--- | :--- |
| Unit Tests | Jest | Individual agent logic, schema validation |
| Integration | Supertest + JUnit 5 | API contracts, DB operations |
| E2E | Playwright | Full user flows, agent routing verification |

---

## 🔄 CI/CD Pipeline

### GitHub Actions
- **PR Checks:** Lint, type-check, unit tests for all services
- **Staging Deploy:** Auto-deploy to staging on `develop` branch merge
- **Production Deploy:** Manual approval gate → deploy to Vercel / Render / Oracle Cloud

### Jenkins
- **Java Service Pipeline:** Build → Test → SonarQube Analysis → Docker Image → Deploy

---

## 📊 Monitoring & Observability

* **Structured Logging:** Winston (Node.js) + SLF4J/Logback (Java)
* **Health Checks:** `/health` endpoints on all services
* **Agent Traces:** LangSmith integration for LLM call tracing and debugging

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by [Chandru HM](https://github.com/ChandruHM)** — Demonstrating 8+ years of full-stack engineering and 3 years of GenAI expertise.