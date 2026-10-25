import { Module, Global } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DrizzleRbacRepository } from './repositories/drizzle-rbac.repository';
import { RoleService } from './services/role.service';
import { PermissionSyncService } from './services/permission-sync.service';
import { BranchAccessService } from './services/branch-access.service';
import { RoleController } from './controllers/role.controller';

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
