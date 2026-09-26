/**
 * Realtime Service Entrypoint
 * Handles WebSocket delivery, presence, subscriptions, and live operational updates.
 * Realtime is not the source of truth for business state.
 */
async function bootstrap() {
  const port = process.env.REALTIME_PORT || 3001;
  console.log(`Realtime service skeleton initialized on port ${port}`);
}

bootstrap();
