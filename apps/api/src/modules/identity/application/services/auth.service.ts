import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { GlobalRole } from '@tavonza/authorization';
import { DrizzleUserRepository } from '../../infrastructure/persistence/drizzle-user.repository';
// Assuming MailService is mocked or works.
// import { MailService } from '../../../notifications/application/mail.service';
import type {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../presentation/http/dto/auth-request.dto';
import type {
  AuthTokensDto,
  RegisterResponseDto,
  UserProfileDto,
} from '../../presentation/http/dto/auth-response.dto';

const OTP_EXPIRY_MINUTES = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: DrizzleUserRepository,
    private readonly jwtService: JwtService,
    // private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists');
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

    const devOtp = await this.generateAndSendOtp(user.email, 'email_verification');

    return {
      message: 'Account created successfully. Please verify your email with the OTP code sent to your email.',
      email: user.email,
      devOtp: process.env.NODE_ENV !== 'production' ? devOtp : undefined,
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

  async refreshTokens(userId: string, _refreshToken: string): Promise<AuthTokensDto> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Access denied');
    }

    // Refresh token validation skipped for stateless JWT
    return this.issueTokens(user);
  }

  async logout(_userId: string): Promise<void> {
    // Stateless JWT logout implies client drops token.
  }

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.contactNo ?? null,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    } as UserProfileDto;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<void> {
    if (dto.type === 'password_reset') {
      const otp = await this.userRepo.findValidPasswordResetOtp(dto.email);
      if (!otp) throw new BadRequestException('OTP code is invalid or has expired');
      if (otp.otp !== dto.code) throw new BadRequestException('Incorrect verification code');
    } else {
      // Stub for email/phone verifications if needed
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<string | undefined> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) return undefined;

    const devOtp = await this.generateAndSendOtp(user.email, 'password_reset');
    return process.env.NODE_ENV !== 'production' ? devOtp : undefined;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.userRepo.findValidPasswordResetOtp(dto.email);
    if (!otp) throw new BadRequestException('OTP code is invalid or has expired');
    if (otp.otp !== dto.code) throw new BadRequestException('Incorrect verification code');

    this.validatePassword(dto.newPassword);
    const newHash = await argon2.hash(dto.newPassword);
    await this.userRepo.updatePassword(user.id, newHash);
  }

  async resendOtp(
    identifier: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
  ): Promise<string | undefined> {
    const user = await this.userRepo.findByEmailOrPhone(identifier);
    if (!user) return undefined; 

    const devOtp = await this.generateAndSendOtp(user.email, type);
    return process.env.NODE_ENV !== 'production' ? devOtp : undefined;
  }

  private async issueTokens(user: any): Promise<AuthTokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
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
        role: user.role,
      } as any,
    };
  }

  private async generateAndSendOtp(
    email: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
  ): Promise<string> {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    if (type === 'password_reset') {
      await this.userRepo.createPasswordResetOtp(email, code, expiresAt);
    }
    return code;
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }
}
