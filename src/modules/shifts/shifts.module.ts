import { Module } from '@nestjs/common';
import { ShiftService } from './services/shift.service';
import { ShiftController } from './controllers/shift.controller';
import { DrizzleShiftRepository } from './repositories/drizzle-shift.repository';

@Module({
  controllers: [ShiftController],
  providers: [ShiftService, DrizzleShiftRepository],
  exports: [ShiftService, DrizzleShiftRepository],
})
export class ShiftsModule {}
