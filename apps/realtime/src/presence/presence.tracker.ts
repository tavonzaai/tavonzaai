import type { WebSocketServer } from 'ws';
import type { ConnectedClient } from '../channels/channel.manager';

export class PresenceTracker {
  private intervalId: NodeJS.Timeout | null = null;

  start(_wss: WebSocketServer, clients: Map<any, ConnectedClient>, intervalMs = 30000): void {
    this.intervalId = setInterval(() => {
      for (const [ws, client] of clients.entries()) {
        if (!client.isAlive) {
          ws.terminate();
          clients.delete(ws);
          continue;
        }

        client.isAlive = false;
        ws.ping();
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
