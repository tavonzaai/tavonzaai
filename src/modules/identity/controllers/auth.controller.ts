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
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { isProduction } from '@/config';
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
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendOtpDto,
  ChangePasswordDto,
} from '../dto/auth-request.dto';
import { UpdateUserProfileDto } from '../dto/user-request.dto';
import { AuthTokensDto, UserProfileDto, MessageResponseDto, RegisterResponseDto } from '../dto/auth-response.dto';
import { UserDetailResponseDto } from '../dto/user-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator';
import type { JwtPayload } from '../adapters/jwt.strategy';
import { ApiStandardErrors } from '../../../common/swagger';
import {
  type AuthClient,
  REFRESH_COOKIE_PATH,
  readCookie,
  refreshCookieName,
  refreshCookieOptions,
} from '../services/token-policy';

function isSecureRequest(req: Request): boolean {
  return isProduction() || req.secure || req.headers['x-forwarded-proto'] === 'https';
}

function setRefreshCookie(req: Request, res: Response, client: AuthClient, token: string): void {
  res.cookie(refreshCookieName(client), token, refreshCookieOptions(isSecureRequest(req)));
}

function clearRefreshCookie(req: Request, res: Response, client: AuthClient): void {
  const { maxAge: _maxAge, ...options } = refreshCookieOptions(isSecureRequest(req));
  res.clearCookie(refreshCookieName(client), { ...options, path: REFRESH_COOKIE_PATH });
}

/**
 * Cookie-authenticated calls must be JSON so cross-site forms cannot replay
 * them; a JSON content type forces a CORS preflight that our origin list blocks.
 */
function assertJsonRequest(req: Request): void {
  if (!req.is('application/json')) {
    throw new UnauthorizedException('Unsupported request');
  }
}

/** Browser apps keep the refresh token in an HttpOnly cookie, never in the body. */
function withoutRefreshToken(tokens: AuthTokensDto): AuthTokensDto {
  const { refreshToken: _refreshToken, ...rest } = tokens;
  return rest;
}

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
  @RateLimit(5, 60)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Login with email and password' })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensDto> {
    const tokens = await this.authService.login(
      { email: dto.email, password: dto.password },
      { client: dto.client, userAgent: req.headers['user-agent'] ?? null, ipAddress: req.ip ?? null },
    );
    if (!dto.client) return tokens;
    setRefreshCookie(req, res, dto.client, tokens.refreshToken!);
    return withoutRefreshToken(tokens);
  }

  /**
   * POST /auth/refresh
   * Rotates the refresh token (single use) and issues a new access token.
   * Browser apps send `{ client }` and the HttpOnly cookie; other clients send `{ refreshToken }`.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue a new access token' })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiUnauthorizedResponse({ description: 'Invalid, expired, reused or revoked refresh token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensDto> {
    if (!dto.client) {
      return this.authService.refreshTokens(dto.refreshToken);
    }

    assertJsonRequest(req);
    const presented = readCookie(req.headers.cookie, refreshCookieName(dto.client));
    try {
      const tokens = await this.authService.refreshTokens(presented);
      setRefreshCookie(req, res, dto.client, tokens.refreshToken!);
      return withoutRefreshToken(tokens);
    } catch (error) {
      clearRefreshCookie(req, res, dto.client);
      throw error;
    }
  }

  /**
   * POST /auth/change-password
   * Authenticated endpoint to change current password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password for currently authenticated user' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Current password incorrect or weak new password' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.changePassword(user.sub, dto, user.sid);
    return { message: 'Password changed successfully' };
  }

  /**
   * POST /auth/logout
   * Revokes the current session: its refresh token can no longer rotate and
   * its access tokens are rejected immediately. Works with an expired access
   * token as long as the refresh cookie/token is presented.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and revoke the current session' })
  @ApiOkResponse({ type: MessageResponseDto })
  async logout(
    @CurrentUser() user: JwtPayload | null,
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    let refreshToken = dto.refreshToken;
    if (dto.client) {
      assertJsonRequest(req);
      refreshToken = readCookie(req.headers.cookie, refreshCookieName(dto.client));
      clearRefreshCookie(req, res, dto.client);
    }
    await this.authService.logout({
      refreshToken,
      sessionId: user?.sid,
      userId: user?.sub,
    });
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
  @RateLimit(5, 60)
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
  @RateLimit(3, 60)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Send password reset OTP to email' })
  @ApiOkResponse({ type: MessageResponseDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    await this.authService.forgotPassword(dto);
    return {
      message: 'If an account exists, a reset code has been sent to your email',
    };
  }

  /**
   * POST /auth/reset-password
   * Figma: New Pass screen — verify OTP then set new password
   */
  @Post('reset-password')
  @RateLimit(5, 60)
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
  @RateLimit(3, 60)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Resend OTP verification code' })
  @ApiOkResponse({ type: MessageResponseDto })
  async resendOtp(@Body() dto: ResendOtpDto): Promise<MessageResponseDto> {
    await this.authService.resendOtp(dto.email, dto.type);
    return {
      message: 'If an account exists, a new code has been sent',
    };
  }
}
