import { Module } from '@nestjs/common';
import { ShiftService } from './application/shift.service';
import { ShiftController } from './presentation/shift.controller';
import { DrizzleShiftRepository } from './infrastructure/persistence/drizzle-shift.repository';

@Module({
  controllers: [ShiftController],
  providers: [ShiftService, DrizzleShiftRepository],
  exports: [ShiftService, DrizzleShiftRepository],
})
export class ShiftsModule {}
