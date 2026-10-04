import type { WebSocket } from 'ws';
import type { AuthenticatedClientContext } from '../authorization/ws-auth';

export interface ConnectedClient {
  ws: WebSocket;
  context: AuthenticatedClientContext;
  isAlive: boolean;
  subscriptions: Set<string>;
}

export class ChannelManager {
  // channelName -> Set of ConnectedClients
  private channels = new Map<string, Set<ConnectedClient>>();

  /**
   * Authorize and subscribe client to a channel
   */
  subscribe(client: ConnectedClient, channel: string): { success: boolean; reason?: string } {
    if (!this.canSubscribe(client.context, channel)) {
      return { success: false, reason: 'Unauthorized channel subscription' };
    }

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel)!.add(client);
    client.subscriptions.add(channel);

    return { success: true };
  }

  /**
   * Unsubscribe client from a channel
   */
  unsubscribe(client: ConnectedClient, channel: string): void {
    const clients = this.channels.get(channel);
    if (clients) {
      clients.delete(client);
      if (clients.size === 0) {
        this.channels.delete(channel);
      }
    }
    client.subscriptions.delete(channel);
  }

  /**
   * Unsubscribe client from all channels on disconnect
   */
  removeClient(client: ConnectedClient): void {
    for (const channel of client.subscriptions) {
      this.unsubscribe(client, channel);
    }
    client.subscriptions.clear();
  }

  /**
   * Broadcast payload to all clients subscribed to a specific channel
   */
  broadcastToChannel(channel: string, payload: unknown): number {
    const clients = this.channels.get(channel);
    if (!clients || clients.size === 0) {
      return 0;
    }

    const message = JSON.stringify({
      channel,
      data: payload,
      timestamp: new Date().toISOString(),
    });

    let sentCount = 0;
    for (const client of clients) {
      if (client.ws.readyState === client.ws.OPEN) {
        client.ws.send(message);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Get total subscriber count for a channel
   */
  getChannelSubscriberCount(channel: string): number {
    return this.channels.get(channel)?.size ?? 0;
  }

  /**
   * Validate subscription permissions based on client context
   */
  private canSubscribe(context: AuthenticatedClientContext, channel: string): boolean {
    if (!context || !context.role) {
      return false;
    }

    // Super Admin & Admin can subscribe to any room
    if (context.role === 'SUPER_ADMIN' || context.role === 'ADMIN') {
      return true;
    }

    // 1. Customer dining table session: session:{tableSessionId}
    if (channel.startsWith('session:')) {
      const sessionId = channel.slice('session:'.length);
      // Customer can subscribe to their own table session
      if (context.tableSessionId && context.tableSessionId === sessionId) {
        return true;
      }
      // Staff (Waiters, Branch Managers, Cashiers) can inspect dining sessions
      if (context.actorType === 'USER') {
        return true;
      }
      return false;
    }

    // 2. Staff channels: branch:{branchId}:...
    if (channel.startsWith('branch:')) {
      const parts = channel.split(':');
      if (parts.length < 3) return false;
      const targetBranchId = parts[1];
      const targetScope = parts[2];

      // Staff must belong to this branch
      if (context.branchId && context.branchId !== targetBranchId) {
        return false;
      }

      // Waiter channel
      if (targetScope === 'waiter') {
        return ['WAITER', 'BRANCH_MANAGER', 'HOST'].includes(context.role);
      }

      // Kitchen / Bar station channel: branch:{branchId}:station:{KITCHEN|BAR}
      if (targetScope === 'station') {
        return ['KITCHEN_STAFF', 'BARTENDER', 'BRANCH_MANAGER'].includes(context.role);
      }

      // Cashier channel
      if (targetScope === 'cashier') {
        return ['CASHIER', 'BRANCH_MANAGER'].includes(context.role);
      }

      // Manager channel
      if (targetScope === 'manager') {
        return ['BRANCH_MANAGER'].includes(context.role);
      }
    }

    return false;
  }
}
