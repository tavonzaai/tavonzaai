import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleBranchRepository } from '../../infrastructure/persistence/drizzle-branch.repository';
import { DrizzleRestaurantRepository } from '../../../restaurants/infrastructure/persistence/drizzle-restaurant.repository';
import { DrizzleOrganizationRepository } from '../../../organizations/infrastructure/persistence/drizzle-organization.repository';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { assertCanAccessOrganization, isSuperAdmin } from '../../../../common/auth/actor.util';
import { assertStaffAssignmentInput } from '../../../authorization/application/staff-access.policy';
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
  constructor(
    private readonly branchRepo: DrizzleBranchRepository,
    private readonly restaurantRepo: DrizzleRestaurantRepository,
    private readonly orgRepo: DrizzleOrganizationRepository,
  ) {}

  // ── Branches ──────────────────────────────────────────────────────────

  async create(user: JwtPayload, dto: CreateBranchDto): Promise<BranchResponseDto> {
    await this.assertRestaurantAccess(user, dto.restaurantId);
    const branch = await this.branchRepo.createBranch({
      restaurantId: dto.restaurantId,
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      timezone: dto.timezone,
    });

    return this.toResponseDto(branch);
  }

  async findById(user: JwtPayload, id: string): Promise<BranchResponseDto> {
    const branch = await this.requireBranch(id);
    await this.assertRestaurantAccess(user, branch.restaurantId);
    return this.toResponseDto(branch);
  }

  async findByRestaurantId(
    user: JwtPayload,
    restaurantId: string,
    includeDeleted = false,
  ): Promise<BranchResponseDto[]> {
    await this.assertRestaurantAccess(user, restaurantId);
    const list = await this.branchRepo.findBranchesByRestaurantId(restaurantId, includeDeleted);
    return list.map((b) => this.toResponseDto(b));
  }

  async findAll(user: JwtPayload, options?: any): Promise<{ data: BranchResponseDto[]; meta: any }> {
    if (options?.restaurantId) {
      await this.assertRestaurantAccess(user, options.restaurantId);
      const res = await this.branchRepo.findAllBranches(options);
      return {
        data: res.data.map((b) => this.toResponseDto(b)),
        meta: res.meta,
      };
    }

    if (isSuperAdmin(user) && !options?.organizationId) {
      const res = await this.branchRepo.findAllBranches(options);
      return {
        data: res.data.map((b) => this.toResponseDto(b)),
        meta: res.meta,
      };
    }

    const organizationId = await this.resolveOrganizationId(user, options?.organizationId);
    const data = await this.branchRepo.findBranchesByOrganizationId(organizationId, {
      search: options?.search,
      includeDeleted: options?.includeDeleted,
    });
    return {
      data: data.map((b) => this.toResponseDto(b)),
      meta: {
        page: Number(options?.page) || 1,
        limit: Number(options?.limit) || data.length,
        total: data.length,
        totalPages: 1,
      },
    };
  }

  async softDelete(user: JwtPayload, id: string): Promise<BranchResponseDto> {
    const branch = await this.requireBranch(id);
    await this.assertRestaurantAccess(user, branch.restaurantId);
    const updated = await this.branchRepo.softDeleteBranch(id);
    if (!updated) {
      throw new NotFoundException(`Failed to soft-delete branch "${id}"`);
    }
    return this.toResponseDto(updated);
  }

  async update(user: JwtPayload, id: string, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const branch = await this.requireBranch(id);
    await this.assertRestaurantAccess(user, branch.restaurantId);

    const updated = await this.branchRepo.updateBranch(id, dto);
    if (!updated) {
      throw new NotFoundException(`Branch not found after update`);
    }

    return this.toResponseDto(updated);
  }

  private async requireBranch(id: string) {
    const branch = await this.branchRepo.findBranchById(id);
    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found`);
    }
    return branch;
  }

  async assertBranchAccess(user: JwtPayload, branchId: string): Promise<void> {
    const branch = await this.requireBranch(branchId);
    await this.assertRestaurantAccess(user, branch.restaurantId);
  }

  private async assertRestaurantAccess(user: JwtPayload, restaurantId: string): Promise<void> {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${restaurantId}" not found`);
    }
    const org = await this.orgRepo.findById(restaurant.organizationId);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${restaurant.organizationId}" not found`);
    }
    assertCanAccessOrganization(user, org);
  }

  private async resolveOrganizationId(user: JwtPayload, requestedId?: string): Promise<string> {
    if (isSuperAdmin(user)) {
      if (!requestedId) {
        throw new ForbiddenException('organizationId is required');
      }
      return requestedId;
    }
    const owned = await this.orgRepo.findByOwnerId(user.sub);
    if (owned.length === 0) {
      throw new ForbiddenException('No organization is associated with this account');
    }
    if (requestedId && !owned.some((org) => org.id === requestedId)) {
      throw new ForbiddenException('You do not have access to this organization');
    }
    const fallbackId = owned[0]?.id;
    if (!requestedId && !user.organizationId && !fallbackId) {
      throw new ForbiddenException('No organization is associated with this account');
    }
    return requestedId || user.organizationId || fallbackId!;
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

  async createStaffForBranch(user: JwtPayload, branchId: string, dto: CreateBranchStaffDto) {
    const branch = await this.branchRepo.findBranchById(branchId);
    if (!branch) {
      throw new NotFoundException(`Branch "${branchId}" not found`);
    }

    const assignment = assertStaffAssignmentInput(user, {
      role: dto.role,
      permissions: dto.permissions,
    });

    return await this.branchRepo.createStaffAndAssignment({
      branchId,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: assignment.role ?? dto.role,
      permissions: assignment.permissions ?? [],
    });
  }

  async assignStaffToBranch(
    user: JwtPayload,
    branchId: string,
    dto: { staffId: string; role: any; permissions?: string[] },
  ) {
    const assignment = assertStaffAssignmentInput(user, {
      role: dto.role,
      permissions: dto.permissions,
    });
    return this.branchRepo.assignStaff({
      branchId,
      staffId: dto.staffId,
      role: assignment.role ?? dto.role,
      permissions: assignment.permissions ?? dto.permissions,
    });
  }

  async updateStaff(user: JwtPayload, branchId: string, staffId: string, dto: any) {
    const assignment = assertStaffAssignmentInput(user, {
      role: dto.role,
      permissions: dto.permissions,
    });
    const updated = await this.branchRepo.updateStaffAssignment(branchId, staffId, {
      ...dto,
      ...assignment,
    });
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
