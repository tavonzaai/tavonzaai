// ============================================================================
// User Service — User Profile, Listing, Filtering & Management
// ============================================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import * as argon2 from '@node-rs/argon2';
import { StorageService, generateKey } from '@/infrastructure/storage';
import { actorHoldsPermission, isPrivilegedGlobalRole } from '@/authorization';
import { DrizzleRbacRepository } from '../../authorization/repositories/drizzle-rbac.repository';
import { DrizzleUserRepository } from '../repositories/drizzle-user.repository';
import { DrizzleAuthSessionRepository } from '../repositories/drizzle-auth-session.repository';
import { DrizzleOrganizationRepository } from '../../organizations/repositories/drizzle-organization.repository';
import {
  isOrgAdmin,
  isSuperAdmin,
  organizationIdsFromActor,
  resolveRequestedOrganizationId,
} from '../../../common/auth/actor.util';
import type { JwtPayload } from '../adapters/jwt.strategy';
import type {
  UpdateUserProfileDto,
  GetUsersFilterDto,
  CreateCustomerUserDto,
  CreateAdminUserDto,
} from '../dto/user-request.dto';
import {
  UserDetailResponseDto,
  UsersListResponseDto,
  MyAssignmentsResponseDto,
} from '../dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: DrizzleUserRepository,
    private readonly orgRepo: DrizzleOrganizationRepository,
    private readonly sessionRepo: DrizzleAuthSessionRepository,
    @Optional() private readonly rbacRepo?: DrizzleRbacRepository,
    @Optional() private readonly storageService?: StorageService,
  ) {}

  /**
   * Update the current authenticated user's profile
   */
  async updateMe(
    userId: string,
    dto: UpdateUserProfileDto,
    avatarFile?: Express.Multer.File,
  ): Promise<UserDetailResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let avatarUrl = dto.avatar;

    // Handle avatar file upload if uploaded via multipart/form-data
    if (avatarFile && this.storageService) {
      try {
        const key = generateKey('avatars', avatarFile.originalname, {
          folder: `users/${userId}`,
          addTimestamp: true,
          addRandomSuffix: true,
        });

        const uploadRes = await this.storageService.uploadFile({
          key,
          file: avatarFile.buffer,
          contentType: avatarFile.mimetype,
          contentLength: avatarFile.size,
          isPublic: true,
        });

        avatarUrl = uploadRes.location;
      } catch (err: any) {
        throw new BadRequestException(`Failed to upload avatar: ${err.message}`);
      }
    }

    // Contact number conflict check if changing phone number
    const contactNumber = dto.contactNo ?? dto.phone;
    if (contactNumber && contactNumber.trim() !== (user.contactNo ?? '')) {
      const existingPhone = await this.userRepo.findByEmailOrPhone(contactNumber.trim());
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictException('This contact number is already in use by another account');
      }
    }

    // Resolve name
    let resolvedName = dto.name;
    if (!resolvedName && (dto.firstName || dto.lastName)) {
      resolvedName = `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim();
    }

    await this.userRepo.updateProfile(userId, {
      name: resolvedName,
      contactNo: contactNumber ? contactNumber.trim() : undefined,
      avatar: avatarUrl,
      fcmToken: dto.fcmToken,
    });

    if (dto.defaultAddress) {
      await this.userRepo.updateCustomerProfile(userId, {
        defaultAddress: dto.defaultAddress,
      });
    }

    const updatedUser = await this.userRepo.findByIdWithRelations(userId);
    return this.toUserDetail(updatedUser);
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(userId: string): Promise<UserDetailResponseDto> {
    const user = await this.userRepo.findByIdWithRelations(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toUserDetail(user);
  }

  /**
   * Get a single user by ID
   */
  async getUserById(targetId: string, currentUser: JwtPayload): Promise<UserDetailResponseDto> {
    // If not self, verify admin/staff reading privileges
    if (currentUser.sub !== targetId && !this.canManageUsers(currentUser)) {
      throw new ForbiddenException('Access denied. You can only view your own profile.');
    }

    const user = await this.userRepo.findByIdWithRelations(targetId);
    if (!user) {
      throw new NotFoundException(`User with ID "${targetId}" not found`);
    }

    await this.assertCanAccessUserRecord(currentUser, user);

    return this.toUserDetail(user);
  }

  /**
   * List all users with filters, search, and pagination
   */
  async getUsers(
    query: GetUsersFilterDto,
    currentUser: JwtPayload,
  ): Promise<UsersListResponseDto> {
    if (!this.canManageUsers(currentUser)) {
      throw new ForbiddenException('Access denied. Administrator or staff permission required.');
    }

    let userIds: string[] | undefined;
    if (!isSuperAdmin(currentUser)) {
      const organizationId = await this.resolveManagedOrganizationId(currentUser);
      userIds = await this.userRepo.findUserIdsForOrganization(organizationId);
    }

    const res = await this.userRepo.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      userIds,
    });

    return {
      data: res.data.map((u: any) => UserDetailResponseDto.fromRecord(u, u.customer)),
      meta: res.meta,
    };
  }

  /**
   * Toggle or update user status (ACTIVE / INACTIVE / BANNED / DELETED)
   */
  async changeStatus(
    targetId: string,
    status: string | undefined,
    currentUser: JwtPayload,
  ): Promise<UserDetailResponseDto> {
    if (!isPrivilegedGlobalRole(currentUser.globalRole) && !isPrivilegedGlobalRole(currentUser.role)) {
      throw new ForbiddenException('Access denied. Administrator permission required.');
    }

    const targetUser = await this.userRepo.findById(targetId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID "${targetId}" not found`);
    }

    await this.assertCanAccessUserRecord(currentUser, targetUser);

    if (targetUser.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify status of a SUPER_ADMIN account');
    }

    if (targetId === currentUser.sub && status && status !== 'ACTIVE') {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    await this.userRepo.updateStatus(targetId, status);
    if (status && status !== 'ACTIVE') {
      await this.sessionRepo.revokeAllForUser(targetId, 'ACCOUNT_DISABLED');
    }
    const updated = await this.userRepo.findByIdWithRelations(targetId);
    return UserDetailResponseDto.fromRecord(updated, updated.customer, updated.assignments);
  }

  /**
   * Soft delete user account by setting status to DELETED
   */
  async softDelete(targetId: string, currentUser: JwtPayload): Promise<UserDetailResponseDto> {
    return this.changeStatus(targetId, 'DELETED', currentUser);
  }

  /**
   * Create a customer user account
   */
  async createCustomer(dto: CreateCustomerUserDto): Promise<UserDetailResponseDto> {
    const existingEmail = await this.userRepo.findByEmail(dto.email.toLowerCase().trim());
    if (existingEmail) {
      throw new ConflictException('An account with this email already exists');
    }

    if (dto.contactNo) {
      const existingPhone = await this.userRepo.findByEmailOrPhone(dto.contactNo.trim());
      if (existingPhone) {
        throw new ConflictException('This contact number is already registered');
      }
    }

    this.validatePassword(dto.password);
    const passwordHash = await argon2.hash(dto.password);

    const created = await this.userRepo.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      name: dto.name.trim(),
      contactNo: dto.contactNo ? dto.contactNo.trim() : undefined,
      avatar: dto.avatar,
      role: 'CUSTOMER',
    });

    if (dto.customer) {
      await this.userRepo.updateCustomerProfile(created.id, {
        defaultAddress: dto.customer.defaultAddress,
        loyaltyPoints: dto.customer.loyaltyPoints ?? 0,
      });
    }

    const userWithRelations = await this.userRepo.findByIdWithRelations(created.id);
    return UserDetailResponseDto.fromRecord(
      userWithRelations,
      userWithRelations.customer,
      userWithRelations.assignments,
    );
  }

  /**
   * Create an admin user account (SUPER_ADMIN only)
   */
  async createAdmin(
    dto: CreateAdminUserDto,
    currentUser: JwtPayload,
  ): Promise<UserDetailResponseDto> {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can create administrator accounts');
    }

    const existingEmail = await this.userRepo.findByEmail(dto.email.toLowerCase().trim());
    if (existingEmail) {
      throw new ConflictException('An account with this email already exists');
    }

    if (dto.contactNo) {
      const existingPhone = await this.userRepo.findByEmailOrPhone(dto.contactNo.trim());
      if (existingPhone) {
        throw new ConflictException('This contact number is already registered');
      }
    }

    this.validatePassword(dto.password);
    const passwordHash = await argon2.hash(dto.password);

    const created = await this.userRepo.createAdmin({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      name: dto.name.trim(),
      contactNo: dto.contactNo ? dto.contactNo.trim() : undefined,
      avatar: dto.avatar,
    });

    const userWithRelations = await this.userRepo.findByIdWithRelations(created.id);
    return UserDetailResponseDto.fromRecord(
      userWithRelations,
      userWithRelations.customer,
      userWithRelations.assignments,
    );
  }

  /**
   * Get staff assignments for the current authenticated user
   */
  async getMyAssignments(userId: string): Promise<MyAssignmentsResponseDto> {
    const staff = await this.userRepo.findStaffProfileByUserId(userId);
    const assignments = await this.userRepo.findStaffAssignments(userId);
    return {
      staffId: staff?.id || (assignments[0] as any)?.staffId || null,
      assignments: assignments as any,
    };
  }

  private async toUserDetail(user: any): Promise<UserDetailResponseDto> {
    let permissions: string[] | undefined = undefined;
    let scopes: any[] | undefined = undefined;
    if (this.rbacRepo) {
      try {
        const live = await this.rbacRepo.getEffectivePermissions(user.id);
        permissions = live.permissions;
        scopes = live.scopes;
      } catch {
        // Fall back gracefully if live lookup fails
      }
    }
    const dto = UserDetailResponseDto.fromRecord(
      user,
      user.customer,
      user.assignments,
      permissions,
      scopes,
    );
    if (user.role === 'ADMIN' || user.role === 'RESTAURANT_OWNER' || user.role === 'STAFF') {
      const accessible = await this.orgRepo.findAccessibleByUserId(user.id);
      const owned = accessible.filter((org) => org.ownerId === user.id);
      dto.organizationId = owned[0]?.id ?? accessible[0]?.id ?? dto.organizationId ?? null;
    }
    return dto;
  }

  private canManageUsers(currentUser: JwtPayload): boolean {
    return (
      isSuperAdmin(currentUser) ||
      isPrivilegedGlobalRole(currentUser.globalRole) ||
      isPrivilegedGlobalRole(currentUser.role) ||
      actorHoldsPermission(currentUser.permissions ?? [], 'users:read') ||
      actorHoldsPermission(currentUser.permissions ?? [], 'staff:read') ||
      actorHoldsPermission(currentUser.permissions ?? [], 'staff:manage')
    );
  }

  private async resolveManagedOrganizationId(currentUser: JwtPayload): Promise<string> {
    if (isSuperAdmin(currentUser) && currentUser.organizationId) {
      return currentUser.organizationId;
    }
    const accessible = await this.orgRepo.findAccessibleByUserId(currentUser.sub);
    const ids = [
      ...accessible.map((org) => org.id),
      ...organizationIdsFromActor(currentUser),
    ];
    if (isOrgAdmin(currentUser)) {
      ids.push(...organizationIdsFromActor(currentUser));
    }
    return resolveRequestedOrganizationId(currentUser, ids, currentUser.organizationId ?? undefined, {
      requireForSuperAdmin: false,
    });
  }

  private async assertCanAccessUserRecord(
    currentUser: JwtPayload,
    target: { id: string; role?: string },
  ): Promise<void> {
    if (isSuperAdmin(currentUser) || currentUser.sub === target.id) {
      return;
    }

    const organizationId = await this.resolveManagedOrganizationId(currentUser);
    const scopedIds = await this.userRepo.findUserIdsForOrganization(organizationId);
    if (!scopedIds.includes(target.id)) {
      throw new ForbiddenException('You do not have access to this user');
    }
  }

  private validatePassword(password: string): void {

    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
  }
}
