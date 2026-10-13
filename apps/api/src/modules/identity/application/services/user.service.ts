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
import * as argon2 from 'argon2';
import { StorageService, generateKey } from '@tavonza/storage';
import { DrizzleUserRepository } from '../../infrastructure/persistence/drizzle-user.repository';
import type { JwtPayload } from '../../infrastructure/adapters/jwt.strategy';
import type {
  UpdateUserProfileDto,
  GetUsersFilterDto,
  CreateCustomerUserDto,
  CreateAdminUserDto,
} from '../../presentation/http/dto/user-request.dto';
import {
  UserDetailResponseDto,
  UsersListResponseDto,
  MyAssignmentsResponseDto,
} from '../../presentation/http/dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: DrizzleUserRepository,
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
    return UserDetailResponseDto.fromRecord(
      updatedUser,
      updatedUser.customer,
      updatedUser.assignments,
    );
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(userId: string): Promise<UserDetailResponseDto> {
    const user = await this.userRepo.findByIdWithRelations(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserDetailResponseDto.fromRecord(user, user.customer, user.assignments);
  }

  /**
   * Get a single user by ID
   */
  async getUserById(targetId: string, currentUser: JwtPayload): Promise<UserDetailResponseDto> {
    // If not self, verify admin/staff reading privileges
    if (currentUser.sub !== targetId) {
      const isPrivileged =
        currentUser.role === 'SUPER_ADMIN' ||
        currentUser.role === 'ADMIN' ||
        currentUser.role === 'RESTAURANT_OWNER' ||
        (Array.isArray(currentUser.permissions) &&
          (currentUser.permissions.includes('staff.read' as any) ||
            currentUser.permissions.includes('staff.manage' as any)));

      if (!isPrivileged) {
        throw new ForbiddenException('Access denied. You can only view your own profile.');
      }
    }

    const user = await this.userRepo.findByIdWithRelations(targetId);
    if (!user) {
      throw new NotFoundException(`User with ID "${targetId}" not found`);
    }

    return UserDetailResponseDto.fromRecord(user, user.customer, user.assignments);
  }

  /**
   * List all users with filters, search, and pagination
   */
  async getUsers(
    query: GetUsersFilterDto,
    currentUser: JwtPayload,
  ): Promise<UsersListResponseDto> {
    // Verify admin/staff privileges
    const isPrivileged =
      currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'RESTAURANT_OWNER' ||
      (Array.isArray(currentUser.permissions) &&
        (currentUser.permissions.includes('staff.read' as any) ||
          currentUser.permissions.includes('staff.manage' as any)));

    if (!isPrivileged) {
      throw new ForbiddenException('Access denied. Administrator or staff permission required.');
    }

    const res = await this.userRepo.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
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
    const isPrivileged =
      currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'RESTAURANT_OWNER';

    if (!isPrivileged) {
      throw new ForbiddenException('Access denied. Administrator permission required.');
    }

    const targetUser = await this.userRepo.findById(targetId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID "${targetId}" not found`);
    }

    // Protect super admin status from modification by lower admins
    if (targetUser.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify status of a SUPER_ADMIN account');
    }

    await this.userRepo.updateStatus(targetId, status);
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

  private validatePassword(password: string): void {

    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
  }
}
