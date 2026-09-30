import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Module({
  imports: [],
  controllers: [],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class AuthorizationModule {}
