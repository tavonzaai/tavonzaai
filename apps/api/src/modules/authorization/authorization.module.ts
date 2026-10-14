import { Module, Global } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DrizzleRbacRepository } from './infrastructure/persistence/drizzle-rbac.repository';
import { RoleService } from './application/services/role.service';
import { PermissionSyncService } from './application/services/permission-sync.service';
import { RoleController } from './presentation/http/role.controller';

@Global()
@Module({
  imports: [],
  controllers: [RoleController],
  providers: [
    PermissionsGuard,
    DrizzleRbacRepository,
    RoleService,
    PermissionSyncService,
  ],
  exports: [
    PermissionsGuard,
    DrizzleRbacRepository,
    RoleService,
  ],
})
export class AuthorizationModule {}
