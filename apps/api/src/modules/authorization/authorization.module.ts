import { Module, Global } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { AuthorizationService } from './authorization.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [AuthorizationService, PermissionsGuard],
  exports: [AuthorizationService, PermissionsGuard],
})
export class AuthorizationModule {}
