// ============================================================================
// Table Sessions Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TableSessionService } from '../application/services/table-session.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../identity/infrastructure/adapters/jwt.strategy';
import {
  ScanQrDto,
  JoinSessionDto,
  OrderModeDto,
  RequestTableOtpDto,
  VerifyTableOtpDto,
  TableOtpRequestResponseDto,
  TableOtpVerifyResponseDto,
  ScanQrResponseDto,
  SessionDetailResponseDto,
  ShareCodeResponseDto,
  SessionActionResponseDto,
  TableSessionRecordDto,
} from './http/dto/table-session.dto';
import { ApiStandardErrors } from '../../../common/swagger';

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
  @ApiOperation({
    summary: '[Customer] Request OTP for table session authentication',
    description: 'Sends a 5-digit verification code to the customer contact (SMS/email) to authenticate onto a table session.',
  })
  @ApiOkResponse({
    type: TableOtpRequestResponseDto,
    description: 'OTP code generated and dispatched',
  })
  @ApiStandardErrors(400, 404, 500)
  async requestTableOtp(@Body() dto: RequestTableOtpDto): Promise<TableOtpRequestResponseDto> {
    return this.sessionService.requestTableAuthOtp(dto);
  }

  /**
   * POST /sessions/table-otp/verify
   * Customer verifies OTP -> opens or joins table session, issues JWT token
   */
  @Post('table-otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Customer] Verify OTP to create/join table session and receive JWT',
    description: 'Verifies the 5-digit code, seats the guest, creates or connects to the table session, and returns an authorized JWT.',
  })
  @ApiOkResponse({
    type: TableOtpVerifyResponseDto,
    description: 'Verified session and JWT authentication token',
  })
  @ApiStandardErrors(400, 404, 500)
  async verifyTableOtp(@Body() dto: VerifyTableOtpDto): Promise<any> {
    return this.sessionService.verifyTableAuthOtp(dto);
  }

  /**
   * POST /sessions/scan
   * Figma: QR Scan Screen → Splash Screen
   */
  @Post('scan')
  @ApiOperation({
    summary: '[Customer] Scan table QR code — creates or joins a table session',
    description: 'Direct QR code scan handler. Automatically allocates a host guest session if table is free, or attaches guest if active.',
  })
  @ApiCreatedResponse({
    type: ScanQrResponseDto,
    description: 'Session context and guest allocation',
  })
  @ApiStandardErrors(400, 404, 500)
  async scanQr(
    @Body() dto: ScanQrDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<any> {
    return this.sessionService.scanQr({
      ...dto,
      userId: user?.sub,
    });
  }

  /**
   * GET /sessions/branch/:branchId
   */
  @Get('branch/:branchId')
  @ApiOperation({
    summary: '[Staff] Get table sessions for branch',
    description: 'Returns active table sessions in the branch with seating and occupancy states.',
  })
  @ApiParam({
    name: 'branchId',
    type: String,
    description: 'Branch UUID',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'PAYMENT_PENDING', 'CLOSED', 'ABANDONED'],
    description: 'Filter sessions by status',
    example: 'ACTIVE',
  })
  @ApiOkResponse({
    type: [TableSessionRecordDto],
    description: 'List of table sessions in branch',
  })
  @ApiStandardErrors(400, 500)
  async getBranchSessions(
    @Param('branchId') branchId: string,
    @Query('status') status?: string,
  ) {
    return this.sessionService.findSessionsByBranch(branchId, status);
  }

  /**
   * GET /sessions/:sessionId
   */
  @Get(':sessionId')
  @ApiOperation({
    summary: '[Customer] Get table session with guests list',
    description: 'Returns session details and list of all guests seated at this dining table.',
  })
  @ApiParam({
    name: 'sessionId',
    type: String,
    description: 'Table Session UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: SessionDetailResponseDto,
    description: 'Active session detail and guests list',
  })
  @ApiStandardErrors(400, 404, 500)
  async getSession(@Param('sessionId') sessionId: string): Promise<any> {
    return this.sessionService.getSession(sessionId);
  }

  /**
   * POST /sessions/:sessionId/share-code
   */
  @Post(':sessionId/share-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Generate share code QR for HostGuest feature',
    description: 'Generates a 6-character alphanumeric code for companions to scan or enter to join this table session.',
  })
  @ApiParam({
    name: 'sessionId',
    type: String,
    description: 'Table Session UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: ShareCodeResponseDto,
    description: 'Generated join code and URL',
  })
  @ApiStandardErrors(400, 401, 404, 500)
  async generateShareCode(@Param('sessionId') sessionId: string): Promise<any> {
    return this.sessionService.generateShareCode(sessionId);
  }

  /**
   * POST /sessions/join
   */
  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Customer] Join a table session using host share code',
    description: 'Allows dining companion to join an active table session using the 6-character join code.',
  })
  @ApiOkResponse({
    type: TableOtpVerifyResponseDto,
    description: 'Joined session and guest credentials',
  })
  @ApiStandardErrors(400, 404, 500)
  async joinSession(
    @Body() dto: JoinSessionDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<any> {
    return this.sessionService.joinByCode({
      code: dto.code,
      userId: user?.sub,
    });
  }

  /**
   * PATCH /sessions/order-mode
   */
  @Patch('order-mode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Customer] Set order mode: individual or together with guests',
    description: 'Updates whether customer wishes to order and bill independently or consolidate into a shared group bill.',
  })
  @ApiOkResponse({
    type: SessionActionResponseDto,
    description: 'Order mode updated successfully',
  })
  @ApiStandardErrors(400, 404, 500)
  async setOrderMode(@Body() dto: OrderModeDto): Promise<any> {
    return this.sessionService.setOrderMode(dto.customerSessionId, dto.orderMode);
  }

  /**
   * POST /sessions/:sessionId/request-bill
   */
  @Post(':sessionId/request-bill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Customer] Request bill for table session',
    description: 'Notifies floor staff and cashier that guests are ready to settle the bill.',
  })
  @ApiParam({
    name: 'sessionId',
    type: String,
    description: 'Table Session UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: SessionActionResponseDto,
    description: 'Bill request dispatched to floor staff',
  })
  @ApiStandardErrors(400, 404, 500)
  async requestBill(@Param('sessionId') sessionId: string): Promise<any> {
    return this.sessionService.requestBill(sessionId);
  }

  /**
   * POST /sessions/:sessionId/call-waiter
   */
  @Post(':sessionId/call-waiter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Customer] Call waiter to table',
    description: 'Sends real-time high-priority assistance alert to assigned table waiter and floor staff.',
  })
  @ApiParam({
    name: 'sessionId',
    type: String,
    description: 'Table Session UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: SessionActionResponseDto,
    description: 'Waiter call acknowledged',
  })
  @ApiStandardErrors(400, 404, 500)
  async callWaiter(
    @Param('sessionId') sessionId: string,
    @Body('reason') reason?: string,
  ): Promise<any> {
    return this.sessionService.callWaiter(sessionId, reason);
  }

  /**
   * POST /sessions/:sessionId/close
   */
  @Post(':sessionId/close')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Staff] Close table session after payment',
    description: 'Enforces session closure invariants: verifies all orders are served and balance is settled, then frees table.',
  })
  @ApiParam({
    name: 'sessionId',
    type: String,
    description: 'Table Session UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: SessionActionResponseDto,
    description: 'Table session closed and table released to AVAILABLE',
  })
  @ApiStandardErrors(400, 401, 404, 409, 500)
  async closeSession(@Param('sessionId') sessionId: string): Promise<any> {
    await this.sessionService.closeSession(sessionId);
    return { success: true, message: 'Session closed' };
  }
}
