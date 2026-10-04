export type ShiftSlotStatus = 'ACTIVE' | 'INACTIVE';

export interface WorkShiftEntity {
  id: string;
  branchId: string;
  staffAssignmentId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  durationMin: number;
  date: string; // YYYY-MM-DD
  status: ShiftSlotStatus;
  checkInAt?: Date | null;
  checkOutAt?: Date | null;
  note?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
