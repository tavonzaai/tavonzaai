import { Module, Global } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DrizzleRbacRepository } from './infrastructure/persistence/drizzle-rbac.repository';
import { RoleService } from './application/services/role.service';
import { PermissionSyncService } from './application/services/permission-sync.service';
import { BranchAccessService } from './application/services/branch-access.service';
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
    BranchAccessService,
  ],
  exports: [
    PermissionsGuard,
    DrizzleRbacRepository,
    RoleService,
    BranchAccessService,
  ],
})
export class AuthorizationModule {}
