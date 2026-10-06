// ============================================================================
// Table Sessions Controller
// ============================================================================
//
// Figma Screens:
//   QR Scan Screen    → POST /sessions/scan
//   Splash Screen     → GET  /sessions/:sessionId
//   Share Code Screen → POST /sessions/:sessionId/share-code
//   Guest Menu        → POST /sessions/join
//   Order Mode        → PATCH /sessions/order-mode
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
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
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { TableSessionService } from '../application/services/table-session.service';
import { JwtAuthGuard } from '../.././../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../identity/infrastructure/adapters/jwt.strategy';

import { IsUUID, IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

// ── DTOs ──────────────────────────────────────────────────────────────

class ScanQrDto {
  @ApiProperty({ description: 'Branch UUID from QR code' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table UUID from QR code' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Human-readable table number', example: 'Table 08' })
  @IsString()
  @IsNotEmpty()
  tableNumber!: string;
}

class JoinSessionDto {
  @ApiProperty({ description: '6-char share code from host QR', example: 'ABC123' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ required: false, description: 'Display name for non-logged-in guests' })
  @IsOptional()
  @IsString()
  displayName?: string;
}

class OrderModeDto {
  @ApiProperty({ enum: ['individual', 'together'] })
  @IsIn(['individual', 'together'])
  orderMode!: 'individual' | 'together';

  @ApiProperty({ description: 'Customer session ID' })
  @IsUUID()
  customerSessionId!: string;
}

export class RequestTableOtpDto {
  @ApiProperty({ description: 'Branch UUID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table UUID' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Customer phone number or email', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiPropertyOptional({ description: 'Optional Table Session UUID if joining active table' })
  @IsOptional()
  @IsUUID()
  tableSessionId?: string;
}

export class VerifyTableOtpDto {
  @ApiProperty({ description: 'Branch UUID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table UUID' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Customer phone number or email', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiProperty({ description: '5-digit verification code', example: '12345' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Optional guest display name', example: 'Alice' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Optional human-readable table number', example: 'Table 12' })
  @IsOptional()
  @IsString()
  tableNumber?: string;
}

// ── Controller ────────────────────────────────────────────────────────

@ApiTags('Customer | Sessions')
@Controller('sessions')
export class TableSessionController {
  constructor(private readonly sessionService: TableSessionService) {}

  /**
   * POST /sessions/table-otp/request
   * Customer requests OTP after scanning QR code
   */
  @Post('table-otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Request OTP for table session authentication' })
  async requestTableOtp(@Body() dto: RequestTableOtpDto) {
    return this.sessionService.requestTableAuthOtp(dto);
  }

  /**
   * POST /sessions/table-otp/verify
   * Customer verifies OTP -> opens or joins table session, issues JWT token
   */
  @Post('table-otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Verify OTP to create/join table session and receive JWT' })
  async verifyTableOtp(@Body() dto: VerifyTableOtpDto) {
    return this.sessionService.verifyTableAuthOtp(dto);
  }

  /**
   * POST /sessions/scan
   * Figma: QR Scan Screen → Splash Screen
   * Called when customer scans the QR code on the table.
   */
  @Post('scan')
  @ApiOperation({ summary: '[Customer] Scan table QR code — creates or joins a table session' })
  @ApiCreatedResponse({ description: 'Session created or returned with table info' })
  async scanQr(
    @Body() dto: ScanQrDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.sessionService.scanQr({
      ...dto,
      userId: user?.sub,
    });
  }

  /**
   * GET /sessions/:sessionId
   * Returns session data with all guests — used for Splash screen info
   */
  @Get(':sessionId')
  @ApiOperation({ summary: '[Customer] Get table session with guests list' })
  @ApiOkResponse({ description: 'Session detail with customers' })
  async getSession(@Param('sessionId') sessionId: string) {
    return this.sessionService.getSession(sessionId);
  }

  /**
   * POST /sessions/:sessionId/share-code
   * Figma: "Share Code" screen — generates 6-char code + 30-second QR
   */
  @Post(':sessionId/share-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer] Generate share code QR for HostGuest feature (30s expiry)' })
  async generateShareCode(@Param('sessionId') sessionId: string) {
    return this.sessionService.generateShareCode(sessionId);
  }

  /**
   * POST /sessions/join
   * Figma: Guest scans host's QR → joins table as guest
   * Shows "You've joined the table as a Host Guest" banner on menu
   */
  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Join a table session using host share code' })
  async joinSession(
    @Body() dto: JoinSessionDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.sessionService.joinByCode({
      code: dto.code,
      userId: user?.sub,
    });
  }

  /**
   * PATCH /sessions/order-mode
   * Figma: "Order Individually" / "Order together" selection in cart
   */
  @Patch('order-mode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Customer] Set order mode: individual or together with guests' })
  async setOrderMode(@Body() dto: OrderModeDto) {
    return this.sessionService.setOrderMode(dto.customerSessionId, dto.orderMode);
  }

  /**
   * POST /sessions/:sessionId/close
   * Called after payment is completed
   */
  @Post(':sessionId/close')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer] Close table session after payment' })
  async closeSession(@Param('sessionId') sessionId: string) {
    await this.sessionService.closeSession(sessionId);
    return { message: 'Session closed' };
  }
}
