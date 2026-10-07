import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleBranchRepository } from '../../infrastructure/persistence/drizzle-branch.repository';
import type {
  CreateBranchDto,
  UpdateBranchDto,
  UpdateBranchSettingsDto,
  SetOperatingHoursDto,
  CreateHolidayDto,
  BranchResponseDto,
  CreateBranchStaffDto,
} from '../../presentation/http/dto/branch.dto';
import type {
  Branch,
  BranchSettings,
  BranchOperatingHours,
  BranchHoliday,
} from '../../domain/entities/branch.entity';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepo: DrizzleBranchRepository) {}

  // ── Branches ──────────────────────────────────────────────────────────

  async create(dto: CreateBranchDto): Promise<BranchResponseDto> {
    const branch = await this.branchRepo.createBranch({
      restaurantId: dto.restaurantId,
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      timezone: dto.timezone,
    });

    return this.toResponseDto(branch);
  }

  async findById(id: string): Promise<BranchResponseDto> {
    const branch = await this.branchRepo.findBranchById(id);
    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found`);
    }
    return this.toResponseDto(branch);
  }

  async findByRestaurantId(restaurantId: string, includeDeleted = false): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepo.findBranchesByRestaurantId(restaurantId, includeDeleted);
    return branches.map((b) => this.toResponseDto(b));
  }

  async findAll(options?: any): Promise<{ data: BranchResponseDto[]; meta: any }> {
    const res = await this.branchRepo.findAllBranches(options);
    return {
      data: res.data.map((b) => this.toResponseDto(b)),
      meta: res.meta,
    };
  }

  async softDelete(id: string): Promise<BranchResponseDto> {
    const branch = await this.branchRepo.findBranchById(id);
    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found`);
    }
    const updated = await this.branchRepo.softDeleteBranch(id);
    if (!updated) {
      throw new NotFoundException(`Failed to soft-delete branch "${id}"`);
    }
    return this.toResponseDto(updated);
  }

  async update(id: string, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const branch = await this.branchRepo.findBranchById(id);
    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found`);
    }

    const updated = await this.branchRepo.updateBranch(id, dto);
    if (!updated) {
      throw new NotFoundException(`Branch not found after update`);
    }

    return this.toResponseDto(updated);
  }

  // ── Branch Settings ───────────────────────────────────────────────────

  async getSettings(branchId: string): Promise<BranchSettings> {
    const settings = await this.branchRepo.findSettingsByBranchId(branchId);
    if (!settings) {
      throw new NotFoundException(`Settings for branch "${branchId}" not found`);
    }
    return settings;
  }

  async updateSettings(
    branchId: string,
    dto: UpdateBranchSettingsDto,
  ): Promise<BranchSettings> {
    const settings = await this.branchRepo.findSettingsByBranchId(branchId);
    if (!settings) {
      throw new NotFoundException(`Settings for branch "${branchId}" not found`);
    }

    const updated = await this.branchRepo.updateSettings(branchId, dto);
    if (!updated) {
      throw new NotFoundException(`Failed to update branch settings`);
    }

    return updated;
  }

  // ── Operating Hours ───────────────────────────────────────────────────

  async getOperatingHours(branchId: string): Promise<BranchOperatingHours[]> {
    return this.branchRepo.findOperatingHours(branchId);
  }

  async setOperatingHours(
    branchId: string,
    dto: SetOperatingHoursDto,
  ): Promise<BranchOperatingHours[]> {
    return this.branchRepo.replaceOperatingHours(branchId, dto.hours);
  }

  // ── Holidays ──────────────────────────────────────────────────────────

  async getHolidays(branchId: string): Promise<BranchHoliday[]> {
    return this.branchRepo.findHolidays(branchId);
  }

  async addHoliday(branchId: string, dto: CreateHolidayDto): Promise<BranchHoliday> {
    return this.branchRepo.createHoliday({
      branchId,
      date: dto.date,
      isClosed: dto.isClosed,
      label: dto.label,
      openTime: dto.openTime,
      closeTime: dto.closeTime,
    });
  }

  // ── Staff Assignments ──────────────────────────────────────────────────

  async getStaffByBranch(branchId: string, filters?: { role?: string; search?: string }) {
    return this.branchRepo.findStaffByBranchId(branchId, filters);
  }

  async getStaffMember(branchId: string, staffId: string) {
    const member = await this.branchRepo.findStaffMemberById(branchId, staffId);
    if (!member) {
      throw new NotFoundException(`Staff member "${staffId}" not found for branch "${branchId}"`);
    }
    return member;
  }

  async createStaffForBranch(branchId: string, dto: CreateBranchStaffDto) {
    const branch = await this.branchRepo.findBranchById(branchId);
    if (!branch) {
      throw new NotFoundException(`Branch "${branchId}" not found`);
    }

    return await this.branchRepo.createStaffAndAssignment({
      branchId,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: dto.role,
      permissions: dto.permissions,
    });
  }

  async assignStaffToBranch(branchId: string, dto: { staffId: string; role: any; permissions?: string[] }) {
    return this.branchRepo.assignStaff({
      branchId,
      staffId: dto.staffId,
      role: dto.role,
      permissions: dto.permissions,
    });
  }

  async updateStaff(branchId: string, staffId: string, dto: any) {
    const updated = await this.branchRepo.updateStaffAssignment(branchId, staffId, dto);
    if (!updated) {
      throw new NotFoundException(`Staff assignment for staff "${staffId}" in branch "${branchId}" not found`);
    }
    return updated;
  }

  async softDeleteStaff(branchId: string, staffId: string) {
    const updated = await this.branchRepo.updateStaffAssignment(branchId, staffId, { isActive: false });
    if (!updated) {
      throw new NotFoundException(`Staff assignment for staff "${staffId}" in branch "${branchId}" not found`);
    }
    return { success: true, message: 'Staff member deactivated' };
  }

  private toResponseDto(branch: Branch): BranchResponseDto {
    return {
      id: branch.id,
      restaurantId: branch.restaurantId,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      timezone: branch.timezone,
      isActive: branch.isActive,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }
}
