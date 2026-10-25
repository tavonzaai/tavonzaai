// ============================================================================
// Permission Sync Service — Synchronizes declared module permissions on bootstrap
// ============================================================================

import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DrizzleRbacRepository } from '../repositories/drizzle-rbac.repository';
import {
  SYSTEM_PERMISSIONS_CATALOG,
  SYSTEM_DEFAULT_ROLES,
} from '../domain/system-permissions';

@Injectable()
export class PermissionSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionSyncService.name);

  constructor(private readonly rbacRepo: DrizzleRbacRepository) {}

  async onApplicationBootstrap() {
    try {
      this.logger.log('🔐 Initializing Dynamic RBAC catalog synchronization...');

      // 1. Sync declared module permissions
      await this.rbacRepo.syncDeclaredPermissions(SYSTEM_PERMISSIONS_CATALOG);
      this.logger.log(
        `✓ Synchronized ${SYSTEM_PERMISSIONS_CATALOG.length} permissions into PostgreSQL`,
      );

      // 2. Sync system default roles and their permission associations
      await this.rbacRepo.syncSystemRoles(SYSTEM_DEFAULT_ROLES);
      this.logger.log(
        `✓ Synchronized ${SYSTEM_DEFAULT_ROLES.length} system roles and role_permissions associations`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to synchronize RBAC permissions on bootstrap: ${err.message}`,
        err.stack,
      );
    }
  }
}
