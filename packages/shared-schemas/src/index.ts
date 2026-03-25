/**
 * FinFlow Shared Schemas
 *
 * Cross-service type definitions and Zod validation schemas.
 * Used by both the Node.js and Next.js services.
 */

export {
  EventSchema,
  CreateEventSchema,
  EventTypeEnum,
  PriorityEnum,
  type Event,
  type CreateEventInput,
} from './schemas/event';

export {
  TransactionSchema,
  CreateTransactionSchema,
  TransactionStatusEnum,
  TransactionTypeEnum,
  type Transaction,
  type CreateTransactionInput,
} from './schemas/transaction';

export {
  AgentResultSchema,
  OrchestratorResponseSchema,
  type AgentResult,
  type OrchestratorResponse,
} from './schemas/agent';

export {
  PaginationSchema,
  ApiResponseSchema,
  type Pagination,
  type ApiResponse,
} from './schemas/common';
