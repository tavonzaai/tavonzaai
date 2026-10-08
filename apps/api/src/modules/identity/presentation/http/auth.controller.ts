// ============================================================================
// Auth Controller — REST endpoints for authentication
// ============================================================================
//
// Figma screens:
//   POST /auth/register      → Create Account screen
//   POST /auth/login         → Log In screen
//   POST /auth/refresh       → Refresh token
//   POST /auth/logout        → Logout
//   GET  /auth/me            → Current user profile
//   POST /auth/verify-otp    → Verify screen (5-digit OTP)
//   POST /auth/forgot-password
//   POST /auth/reset-password → New Pass screen
//   POST /auth/resend-otp    → "Resend" on Verify screen
// ============================================================================

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { UserService } from '../../application/services/user.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendOtpDto,
} from './dto/auth-request.dto';
import { UpdateUserProfileDto } from './dto/user-request.dto';
import { AuthTokensDto, UserProfileDto, MessageResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
import { UserDetailResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../infrastructure/adapters/jwt.strategy';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Identity | Authentication')
@ApiStandardErrors(400, 401, 500)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * POST /auth/register
   * Figma: Create Account screen
   * Fields: firstName, lastName, email, phone, password
   * Sends OTP for verification and does not return tokens until verified/logged in.
   */
  @Post('register')
  @ApiOperation({ summary: '[Customer] Create a new customer account' })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiBadRequestResponse({ description: 'Weak password or invalid input' })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Figma: Log In screen
   * Fields: email, password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Login with email and password' })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh
   * Rotate access + refresh tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer] Refresh access token' })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse()
  async refresh(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RefreshTokenDto,
  ): Promise<AuthTokensDto> {
    return this.authService.refreshTokens(user.sub, dto.refreshToken);
  }

  /**
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer] Logout and invalidate refresh token' })
  @ApiOkResponse({ type: MessageResponseDto })
  async logout(@CurrentUser() user: JwtPayload): Promise<MessageResponseDto> {
    await this.authService.logout(user.sub);
    return { message: 'Logged out successfully' };
  }

  /**
   * GET /auth/me
   * Returns current authenticated user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer] Get current user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiUnauthorizedResponse()
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserProfileDto> {
    return this.authService.getMe(user.sub);
  }

  /**
   * PATCH /auth/me
   * Update current user profile
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer] Update current user profile' })
  @ApiOkResponse({ type: UserDetailResponseDto })
  @ApiUnauthorizedResponse()
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserDetailResponseDto> {
    return this.userService.updateMe(user.sub, dto);
  }

  /**
   * POST /auth/verify-otp
   * Figma: Verify screen — 5-digit code from email
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Verify OTP code (email verification or password reset)' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<MessageResponseDto> {
    await this.authService.verifyOtp(dto);
    return { message: 'Verification successful' };
  }

  /**
   * POST /auth/forgot-password
   * Sends OTP code to email for password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Send password reset OTP to email' })
  @ApiOkResponse({ type: MessageResponseDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    const devOtp = await this.authService.forgotPassword(dto);
    return {
      message: 'If an account exists, a reset code has been sent to your email',
      devOtp,
    };
  }

  /**
   * POST /auth/reset-password
   * Figma: New Pass screen — verify OTP then set new password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Reset password using OTP code' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid OTP or weak password' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    await this.authService.resetPassword(dto);
    return { message: 'Password reset successfully' };
  }

  /**
   * POST /auth/resend-otp
   * Figma: "Resend ( 01.85 )" countdown on Verify screen
   */
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Resend OTP verification code' })
  @ApiOkResponse({ type: MessageResponseDto })
  async resendOtp(@Body() dto: ResendOtpDto): Promise<MessageResponseDto> {
    const devOtp = await this.authService.resendOtp(dto.email, dto.type);
    return {
      message: 'If an account exists, a new code has been sent',
      devOtp,
    };
  }
}
