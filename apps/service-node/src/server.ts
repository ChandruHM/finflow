import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { healthRouter } from './routes/health';
import { eventsRouter } from './routes/events';
import { agentRouter } from './routes/agent';
import { expenseRouter } from './routes/expense';
import { setupWebSocket } from './websocket/handler';

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO Setup ────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// ─── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/expenses', expenseRouter);  // SpendWise expense routes

// ─── WebSocket ──────────────────────────────────────────
setupWebSocket(io);

// Make io accessible to routes for real-time push
app.set('io', io);

// ─── Global Error Handler ───────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start Server ───────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000', 10);

async function bootstrap() {
  await connectDatabase();

  httpServer.listen(PORT, () => {
    logger.info(`🚀 SpendWise Node Service running on port ${PORT}`);
    logger.info(`📡 WebSocket server ready`);
    logger.info(`🤖 Agent orchestrator loaded (LangGraph)`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export { app, io };
