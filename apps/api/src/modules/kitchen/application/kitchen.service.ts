import { Injectable } from '@nestjs/common';
import { OutboxService } from '@tavonza/database';
import { DrizzleKitchenRepository } from '../infrastructure/persistence/drizzle-kitchen.repository';
import type {
  UpdateKitchenItemStatusDto,
  ToggleItemAvailabilityDto,
} from '../presentation/http/dto/kitchen.dto';
import type {
  KitchenTicketItemEntity,
  KitchenStationType,
} from '../domain/entities/kitchen-ticket.entity';

@Injectable()
export class KitchenService {
  constructor(
    private readonly kitchenRepo: DrizzleKitchenRepository,
    private readonly outboxService: OutboxService,
  ) {}

  async getActiveTickets(
    branchId: string,
    station?: KitchenStationType
  ): Promise<KitchenTicketItemEntity[]> {
    return this.kitchenRepo.findActiveTickets(branchId, station);
  }

  async updateItemStatus(
    itemId: string,
    dto: UpdateKitchenItemStatusDto
  ): Promise<void> {
    const updated = await this.kitchenRepo.updateItemStatus(
      itemId,
      dto.status,
      dto.unavailableReason
    );

    if (updated && updated.branchId) {
      await this.outboxService.publishEvent({
        aggregateType: 'KITCHEN_ITEM',
        aggregateId: itemId,
        eventType: 'OrderKitchenStatusChanged',
        branchId: updated.branchId,
        payload: {
          orderId: updated.orderId,
          orderNumber: updated.orderNumber,
          branchId: updated.branchId,
          tableSessionId: updated.tableSessionId,
          tableLabel: updated.tableLabel,
          orderItemId: updated.id,
          productName: updated.productName,
          stationType: updated.stationType,
          status: updated.status,
          unavailableReason: dto.unavailableReason,
          occurredAt: new Date().toISOString(),
        },
      });

      // Cascade item preparation status to parent order and table
      const { order, items } = await this.kitchenRepo.getOrderAndSiblingItems(updated.orderId);
      if (order && items.length > 0) {
        const activeItems = items.filter(
          (i) => i.status !== 'UNAVAILABLE' && i.status !== 'CANCELLED'
        );

        if (activeItems.length > 0) {
          const allServed = activeItems.every((i) => i.status === 'SERVED');
          const allReadyOrServed = activeItems.every(
            (i) => i.status === 'READY' || i.status === 'SERVED'
          );
          const anyPreparing = activeItems.some(
            (i) => i.status === 'PREPARING' || i.status === 'READY' || i.status === 'SERVED'
          );

          if (allServed && order.status !== 'SERVED') {
            await this.kitchenRepo.updateOrderStatus(order.id, 'SERVED');
            if (order.tableId) {
              await this.kitchenRepo.updateTableStatus(order.tableId, 'SERVING');
              await this.outboxService.publishEvent({
                aggregateType: 'TABLE',
                aggregateId: order.tableId,
                eventType: 'TableStatusChanged',
                branchId: order.branchId,
                payload: {
                  tableId: order.tableId,
                  tableLabel: updated.tableLabel ?? 'Table',
                  branchId: order.branchId,
                  serviceStatus: 'SERVING',
                  operationalFlag: 'NORMAL',
                  activeSessionId: order.tableSessionId,
                  updatedAt: new Date().toISOString(),
                },
              });
            }
            await this.outboxService.publishEvent({
              aggregateType: 'ORDER',
              aggregateId: order.id,
              eventType: 'OrderServed',
              branchId: order.branchId,
              payload: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                branchId: order.branchId,
                tableSessionId: order.tableSessionId,
                servedAt: new Date().toISOString(),
              },
            });
          } else if (allReadyOrServed && order.status !== 'READY' && order.status !== 'SERVED') {
            await this.kitchenRepo.updateOrderStatus(order.id, 'READY');
            await this.outboxService.publishEvent({
              aggregateType: 'ORDER',
              aggregateId: order.id,
              eventType: 'OrderStatusChanged',
              branchId: order.branchId,
              payload: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                branchId: order.branchId,
                tableId: order.tableId,
                tableSessionId: order.tableSessionId,
                previousStatus: order.status,
                newStatus: 'READY',
                occurredAt: new Date().toISOString(),
              },
            });
          } else if (anyPreparing && (order.status === 'CONFIRMED' || order.status === 'PENDING')) {
            await this.kitchenRepo.updateOrderStatus(order.id, 'PREPARING');
            if (order.tableId) {
              await this.kitchenRepo.updateTableStatus(order.tableId, 'PREPARING');
              await this.outboxService.publishEvent({
                aggregateType: 'TABLE',
                aggregateId: order.tableId,
                eventType: 'TableStatusChanged',
                branchId: order.branchId,
                payload: {
                  tableId: order.tableId,
                  tableLabel: updated.tableLabel ?? 'Table',
                  branchId: order.branchId,
                  serviceStatus: 'PREPARING',
                  operationalFlag: 'NORMAL',
                  activeSessionId: order.tableSessionId,
                  updatedAt: new Date().toISOString(),
                },
              });
            }
            await this.outboxService.publishEvent({
              aggregateType: 'ORDER',
              aggregateId: order.id,
              eventType: 'OrderStatusChanged',
              branchId: order.branchId,
              payload: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                branchId: order.branchId,
                tableId: order.tableId,
                tableSessionId: order.tableSessionId,
                previousStatus: order.status,
                newStatus: 'PREPARING',
                occurredAt: new Date().toISOString(),
              },
            });
          }
        }
      }
    }
  }

  async toggleMenuItemAvailability(
    menuItemId: string,
    dto: ToggleItemAvailabilityDto
  ): Promise<void> {
    await this.kitchenRepo.toggleMenuItemAvailability(
      menuItemId,
      dto.isAvailable
    );
  }
}
