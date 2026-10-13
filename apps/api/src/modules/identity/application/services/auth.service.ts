import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'node:crypto';
import * as argon2 from 'argon2';
import { GlobalRole, resolvePermissions } from '@tavonza/authorization';
import { DrizzleUserRepository } from '../../infrastructure/persistence/drizzle-user.repository';
import { DrizzleRbacRepository } from '../../../authorization/infrastructure/persistence/drizzle-rbac.repository';
import { DrizzleOrganizationRepository } from '../../../organizations/infrastructure/persistence/drizzle-organization.repository';
import { MailService } from '../../../notifications/application/mail.service';
import type {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../../presentation/http/dto/auth-request.dto';
import type {
  AuthTokensDto,
  RegisterResponseDto,
  UserProfileDto,
} from '../../presentation/http/dto/auth-response.dto';

const OTP_EXPIRY_MINUTES = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: DrizzleUserRepository,
    private readonly orgRepo: DrizzleOrganizationRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Optional() private readonly rbacRepo?: DrizzleRbacRepository,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    if (dto.phone) {
      const existingPhone = await this.userRepo.findByEmailOrPhone(dto.phone.trim());
      if (existingPhone) {
        throw new ConflictException('This phone number is already in use.');
      }
    }

    this.validatePassword(dto.password);
    const passwordHash = await argon2.hash(dto.password);

    const user = await this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
      contactNo: dto.phone,
      role: GlobalRole.CUSTOMER,
    });

    await this.generateAndSendOtp(
      user.email,
      'email_verification',
      dto.firstName.trim(),
    );

    return {
      message: 'Account created successfully. Please verify your email with the OTP code sent to your email.',
      email: user.email,
    };
  }

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user || user.status !== 'ACTIVE' || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await argon2.verify(user.password, dto.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  async refreshTokens(userId?: string, refreshToken?: string): Promise<AuthTokensDto> {
    let resolvedUserId = userId;
    if (!resolvedUserId && refreshToken) {
      try {
        const payload: any = this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
        });
        resolvedUserId = payload?.sub;
      } catch {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
    }

    if (!resolvedUserId) {
      throw new UnauthorizedException('Access denied');
    }

    const user = await this.userRepo.findById(resolvedUserId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Access denied');
    }

    return this.issueTokens(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.password) {
      throw new BadRequestException('User account not found or has no local password');
    }

    const currentPass = dto.currentPassword || dto.oldPassword;
    if (!currentPass) {
      throw new BadRequestException('Current password is required');
    }

    const match = await argon2.verify(user.password, currentPass);
    if (!match) {
      throw new BadRequestException('Current password does not match');
    }

    this.validatePassword(dto.newPassword);
    const newHash = await argon2.hash(dto.newPassword);
    await this.userRepo.updatePassword(user.id, newHash);
  }

  async logout(_userId: string): Promise<void> {
    // Stateless JWT logout implies client drops token.
  }

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const assignments = await this.userRepo.findStaffAssignments(user.id);
    const primaryAssignment = assignments[0];
    const effectiveRole = primaryAssignment?.role || user.role;
    const branchId = primaryAssignment?.branchId ?? null;
    const branchName = primaryAssignment?.branchName ?? null;
    const ownedOrgs = await this.orgRepo.findByOwnerId(user.id);
    const organizationId = ownedOrgs[0]?.id ?? null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: effectiveRole,
      globalRole: user.role,
      organizationId,
      branchId,
      branchName,
      assignments,
      phone: user.contactNo ?? null,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    } as any;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<void> {
    if (dto.type === 'phone_verification') {
      throw new BadRequestException('Phone verification is not supported');
    }

    const email = dto.email.trim().toLowerCase();
    const otp = await this.userRepo.findValidAuthOtp(email, dto.type);
    if (!otp) throw new BadRequestException('OTP code is invalid or has expired');
    if (otp.otp !== dto.code) throw new BadRequestException('Incorrect verification code');

    if (dto.type === 'email_verification') {
      const consumed = await this.userRepo.consumeAuthOtp(email, dto.type, dto.code);
      if (!consumed) throw new BadRequestException('OTP code is invalid or has expired');
      await this.userRepo.markEmailVerified(email);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) return;

    await this.generateAndSendOtp(
      user.email,
      'password_reset',
      user.name.split(' ')[0],
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.userRepo.findValidAuthOtp(user.email, 'password_reset');
    if (!otp) throw new BadRequestException('OTP code is invalid or has expired');
    if (otp.otp !== dto.code) throw new BadRequestException('Incorrect verification code');

    this.validatePassword(dto.newPassword);
    const newHash = await argon2.hash(dto.newPassword);
    const consumed = await this.userRepo.consumeAuthOtp(
      user.email,
      'password_reset',
      dto.code,
    );
    if (!consumed) throw new BadRequestException('OTP code is invalid or has expired');
    await this.userRepo.updatePassword(user.id, newHash);
  }

  async resendOtp(
    identifier: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
  ): Promise<void> {
    if (type === 'phone_verification') {
      throw new BadRequestException('Phone verification is not supported');
    }
    const user = await this.userRepo.findByEmailOrPhone(identifier);
    if (!user) return;

    await this.generateAndSendOtp(
      user.email,
      type,
      user.name.split(' ')[0],
    );
  }

  private async issueTokens(user: any): Promise<AuthTokensDto> {
    let effectiveRole = user.role;
    let effectivePermissions: string[] = [];

    // 1. Resolve dynamic database-backed role & permissions if assigned
    if (this.rbacRepo) {
      try {
        const dynamicRole = await this.rbacRepo.getUserRole(user.id);
        if (dynamicRole) {
          effectiveRole = dynamicRole.roleName.toUpperCase().replace(/\s+/g, '_');
          effectivePermissions = await this.rbacRepo.getUserPermissions(user.id);
        }
      } catch {
        // Fallback to legacy assignments on error
      }
    }

    // 2. Fallback to branch staff assignments and static role resolutions
    const assignments = await this.userRepo.findStaffAssignments(user.id);
    const primaryAssignment = assignments[0];
    if (!effectivePermissions || effectivePermissions.length === 0) {
      effectiveRole = primaryAssignment?.role || user.role;
      effectivePermissions = resolvePermissions(
        effectiveRole,
        (primaryAssignment?.permissions as any) ?? [],
      ) as string[];
    }

    const branchId = primaryAssignment?.branchId ?? null;
    const branchName = primaryAssignment?.branchName ?? null;
    const ownedOrgs = await this.orgRepo.findByOwnerId(user.id);
    const organizationId = ownedOrgs[0]?.id ?? null;

    const payload = {
      sub: user.id,
      email: user.email,
      role: effectiveRole,
      globalRole: user.role,
      organizationId,
      branchId,
      permissions: effectivePermissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_EXPIRATION ?? '15m') as unknown as number,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRATION ?? '7d') as unknown as number,
      secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        globalRole: user.role,
        organizationId,
        branchId,
        branchName,
        assignments,
      } as any,
    };
  }

  private async generateAndSendOtp(
    email: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
    firstName: string,
  ): Promise<string> {
    if (type === 'phone_verification') {
      throw new BadRequestException('Phone verification is not supported');
    }

    const code = randomInt(10000, 100000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepo.createAuthOtp(email, code, type, expiresAt);

    const mailResult = type === 'password_reset'
      ? await this.mailService.sendPasswordResetCode(email, firstName, code)
      : await this.mailService.sendVerificationCode(email, firstName, code);

    if (!mailResult.success) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(`Mail delivery failed in dev mode, but OTP was generated: ${code}`);
        return code;
      }
      await this.userRepo.deleteAuthOtp(email, type, code);
      throw new ServiceUnavailableException('Unable to send the OTP email. Please try again.');
    }

    return code;
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }
}
