import { Module } from '@nestjs/common';
import { StorageModule as TavonzaStorageModule } from '@/infrastructure/storage';
import { StorageController } from './storage.controller';

@Module({
  imports: [TavonzaStorageModule],
  controllers: [StorageController],
  exports: [TavonzaStorageModule],
})
export class ApiStorageModule {}
