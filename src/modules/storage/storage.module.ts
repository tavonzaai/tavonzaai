import { Module } from '@nestjs/common';
import { StorageModule as TavonzaStorageModule } from '@/infrastructure/storage';
import { StorageController } from './storage.controller';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [TavonzaStorageModule, IdentityModule],
  controllers: [StorageController],
  exports: [TavonzaStorageModule],
})
export class ApiStorageModule {}
