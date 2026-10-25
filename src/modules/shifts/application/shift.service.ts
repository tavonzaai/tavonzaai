import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleShiftRepository } from '../infrastructure/persistence/drizzle-shift.repository';
import type {
  CreateShiftDto,
  ClockInDto,
  ClockOutDto,
} from '../presentation/http/dto/shift.dto';
import type { WorkShiftEntity } from '../domain/entities/shift.entity';

@Injectable()
export class ShiftService {
  constructor(private readonly shiftRepo: DrizzleShiftRepository) {}

  async createShift(dto: CreateShiftDto): Promise<WorkShiftEntity> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const durationMin = dto.durationMin ?? Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    return this.shiftRepo.createShift({
      branchId: dto.branchId,
      staffAssignmentId: dto.staffAssignmentId,
      name: dto.name,
      startTime,
      endTime,
      durationMin,
      date: dto.date,
      note: dto.note,
      createdById: dto.createdById,
    });
  }

  async getShiftById(id: string): Promise<WorkShiftEntity> {
    const shift = await this.shiftRepo.findById(id);
    if (!shift) throw new NotFoundException(`Work shift ${id} not found`);
    return shift;
  }

  async getBranchShifts(branchId: string, date?: string): Promise<WorkShiftEntity[]> {
    return this.shiftRepo.findByBranch(branchId, date);
  }

  async getStaffShifts(staffAssignmentId: string, date?: string): Promise<WorkShiftEntity[]> {
    return this.shiftRepo.findByStaffAssignment(staffAssignmentId, date);
  }

  async clockIn(shiftId: string, dto?: ClockInDto): Promise<WorkShiftEntity> {
    const shift = await this.getShiftById(shiftId);

    if (shift.status === 'INACTIVE') {
      throw new BadRequestException('Cannot clock in to an inactive shift');
    }
    if (shift.checkInAt) {
      throw new BadRequestException('Staff has already clocked in to this shift');
    }

    const checkInAt = dto?.timestamp ? new Date(dto.timestamp) : new Date();
    return this.shiftRepo.updateShift(shiftId, {
      checkInAt,
      note: dto?.note ? `${shift.note ? shift.note + '; ' : ''}Clock-in: ${dto.note}` : shift.note,
    });
  }

  async clockOut(shiftId: string, dto?: ClockOutDto): Promise<WorkShiftEntity> {
    const shift = await this.getShiftById(shiftId);

    if (!shift.checkInAt) {
      throw new BadRequestException('Cannot clock out without clocking in first');
    }
    if (shift.checkOutAt) {
      throw new BadRequestException('Staff has already clocked out of this shift');
    }

    const checkOutAt = dto?.timestamp ? new Date(dto.timestamp) : new Date();
    return this.shiftRepo.updateShift(shiftId, {
      checkOutAt,
      note: dto?.note ? `${shift.note ? shift.note + '; ' : ''}Clock-out: ${dto.note}` : shift.note,
    });
  }

  async cancelShift(shiftId: string, reason?: string): Promise<WorkShiftEntity> {
    const shift = await this.getShiftById(shiftId);
    if (shift.status === 'INACTIVE') {
      throw new BadRequestException('Shift is already inactive');
    }

    return this.shiftRepo.updateShift(shiftId, {
      status: 'INACTIVE',
      note: reason ? `${shift.note ? shift.note + '; ' : ''}Cancelled: ${reason}` : shift.note,
    });
  }
}
