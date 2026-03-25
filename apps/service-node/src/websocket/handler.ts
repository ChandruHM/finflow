import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface RealTimeEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

export function setupWebSocket(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    // ─── Join specific event channels ─────────────────────
    socket.on('subscribe', (channel: string) => {
      socket.join(channel);
      logger.info(`Client ${socket.id} subscribed to channel: ${channel}`);
      socket.emit('subscribed', { channel, status: 'ok' });
    });

    // ─── Unsubscribe from channels ────────────────────────
    socket.on('unsubscribe', (channel: string) => {
      socket.leave(channel);
      logger.info(`Client ${socket.id} unsubscribed from channel: ${channel}`);
    });

    // ─── Receive real-time events ─────────────────────────
    socket.on('event', (event: RealTimeEvent) => {
      logger.info(`Real-time event from ${socket.id}: ${event.type}`);

      // Broadcast to the relevant channel
      io.to(event.type).emit('event:update', {
        ...event,
        processedAt: new Date().toISOString(),
        sourceSocket: socket.id,
      });
    });

    // ─── Agent status stream ──────────────────────────────
    socket.on('agent:status', () => {
      socket.emit('agent:status:response', {
        nodeFlowAgent: 'active',
        connections: io.engine.clientsCount,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Disconnect ───────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });

    // ─── Error handling ───────────────────────────────────
    socket.on('error', (error) => {
      logger.error(`WebSocket error for ${socket.id}:`, error);
    });
  });

  logger.info('📡 WebSocket handler initialized');
}
