/**
 * Realtime Service Entrypoint
 * Handles WebSocket delivery, presence, subscriptions, and live operational updates.
 * Realtime is not the source of truth for business state.
 */
import { ChannelManager } from './channels/channel.manager';
import { RedisSubscriber } from './publishers/redis.subscriber';
import { RealtimeWebSocketServer } from './gateways/websocket.server';

async function bootstrap() {
  const port = parseInt(process.env.REALTIME_PORT || '3001', 10);

  console.log('====================================================');
  console.log('  ⚡ Tavonza AI Realtime Service Starting');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Port:        ${port}`);
  console.log(`  Redis URL:   ${process.env.REDIS_URL ? '[CONFIGURED]' : 'redis://localhost:6379'}`);
  console.log('====================================================');

  const channelManager = new ChannelManager();
  const redisSubscriber = new RedisSubscriber(channelManager);
  const server = new RealtimeWebSocketServer(port, channelManager);

  await redisSubscriber.start();
  await server.start();

  console.log('✅ Realtime gateway is ready to accept WebSocket connections.');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down Realtime service...`);
    await server.close();
    await redisSubscriber.close();
    console.log('👋 Realtime service shutdown complete.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('💥 Fatal error starting Realtime service:', err);
  process.exit(1);
});
