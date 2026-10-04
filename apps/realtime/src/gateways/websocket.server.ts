import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { authenticateWsRequest } from '../authorization/ws-auth';
import { ChannelManager, type ConnectedClient } from '../channels/channel.manager';
import { PresenceTracker } from '../presence/presence.tracker';

export class RealtimeWebSocketServer {
  private server: http.Server;
  private wss: WebSocketServer;
  private clients = new Map<WebSocket, ConnectedClient>();
  private presenceTracker = new PresenceTracker();

  constructor(
    private readonly port: number,
    private readonly channelManager: ChannelManager
  ) {
    this.server = http.createServer((req, res) => {
      // Basic health check endpoint
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            connectedClients: this.clients.size,
            uptime: process.uptime(),
          })
        );
        return;
      }

      res.writeHead(404);
      res.end();
    });

    this.wss = new WebSocketServer({ noServer: true });
    this.setupUpgradeHandler();
    this.setupConnectionHandler();
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`[RealtimeGateway] WebSocket server listening on ws://localhost:${this.port}`);
        this.presenceTracker.start(this.wss, this.clients);
        resolve();
      });
    });
  }

  async close(): Promise<void> {
    this.presenceTracker.stop();
    for (const [ws, client] of this.clients.entries()) {
      this.channelManager.removeClient(client);
      ws.close(1001, 'Server shutting down');
    }
    this.clients.clear();

    await new Promise<void>((resolve) => {
      this.wss.close(() => {
        this.server.close(() => resolve());
      });
    });
  }

  private setupUpgradeHandler(): void {
    this.server.on('upgrade', (request, socket, head) => {
      const context = authenticateWsRequest(request);

      if (!context) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request, context);
      });
    });
  }

  private setupConnectionHandler(): void {
    this.wss.on('connection', (ws: WebSocket, _request: http.IncomingMessage, context: any) => {
      const client: ConnectedClient = {
        ws,
        context,
        isAlive: true,
        subscriptions: new Set(),
      };

      this.clients.set(ws, client);

      // Auto-subscribe customer to their table session if available
      if (context.tableSessionId) {
        this.channelManager.subscribe(client, `session:${context.tableSessionId}`);
      }

      // Auto-subscribe staff to their branch default room if available
      if (context.branchId && context.role === 'WAITER') {
        this.channelManager.subscribe(client, `branch:${context.branchId}:waiter`);
      }

      ws.on('pong', () => {
        client.isAlive = true;
      });

      ws.on('message', (rawData) => {
        try {
          const message = JSON.parse(rawData.toString());
          this.handleClientMessage(client, message);
        } catch {
          ws.send(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });

      ws.on('close', () => {
        this.channelManager.removeClient(client);
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.warn(`[RealtimeGateway] Client socket error: ${err.message}`);
        this.channelManager.removeClient(client);
        this.clients.delete(ws);
      });

      // Send initial connection ACK
      ws.send(
        JSON.stringify({
          type: 'CONNECTED',
          actor: context.userId || context.guestSessionId,
          role: context.role,
          activeSubscriptions: Array.from(client.subscriptions),
        })
      );
    });
  }

  private handleClientMessage(client: ConnectedClient, message: any): void {
    switch (message.type) {
      case 'SUBSCRIBE': {
        if (!message.channel) return;
        const res = this.channelManager.subscribe(client, message.channel);
        client.ws.send(
          JSON.stringify({
            type: 'SUBSCRIBED',
            channel: message.channel,
            success: res.success,
            reason: res.reason,
          })
        );
        break;
      }

      case 'UNSUBSCRIBE': {
        if (!message.channel) return;
        this.channelManager.unsubscribe(client, message.channel);
        client.ws.send(
          JSON.stringify({
            type: 'UNSUBSCRIBED',
            channel: message.channel,
          })
        );
        break;
      }

      case 'PING': {
        client.ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        break;
      }

      default:
        client.ws.send(JSON.stringify({ error: `Unknown message type: ${message.type}` }));
    }
  }
}
