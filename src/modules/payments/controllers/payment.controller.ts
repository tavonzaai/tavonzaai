import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Permission } from '@/authorization';
import { PaymentService } from '../services/payment.service';
import {
  CreatePaymentDto,
  CreateSplitPaymentDto,
  ApplyDiscountDto,
  RefundPaymentDto,
  PaymentOptionsResponseDto,
  PaymentRecordResponseDto,
  PaymentDetailResponseDto,
  DiscountEvaluationResponseDto,
  TableBillCalculationResponseDto,
  CreateStripePaymentIntentDto,
  StripePaymentIntentResponseDto,
  VerifyStripePaymentDto,
  RequestOfflinePaymentDto,
  ConfirmOfflinePaymentDto,
  RejectOfflinePaymentDto,
  OfflinePaymentRequestItemDto,
} from '../dto/payment.dto';
import { ApiStandardErrors } from '../../../common/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';

@ApiTags('Payments & Billing')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('options')
  @ApiOperation({
    summary: '[Customer/Cashier] Get available payment methods',
    description: 'Retrieves all payment gateway methods and in-venue options configured for the branch.',
  })
  @ApiQuery({ name: 'branchId', required: false, type: String, example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ type: PaymentOptionsResponseDto, description: 'Supported payment methods' })
  @ApiStandardErrors(400, 500)
  async getOptions(@Query('branchId') branchId?: string): Promise<PaymentOptionsResponseDto> {
    return this.paymentService.getPaymentOptions(branchId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Cashier] Process payment',
    description: 'Processes a single payment for an entire order or table session, with optional promo discount voucher.',
  })
  @ApiCreatedResponse({ type: PaymentRecordResponseDto, description: 'Payment recorded and marked PAID' })
  @ApiStandardErrors(400, 401, 403, 404, 409, 500)
  async createPayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentDto,
  ): Promise<any> {
    return this.paymentService.createPayment(user, dto);
  }

  @Post('split')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Cashier] Process split payment',
    description: 'Processes itemized or equal split payment allocation across specific line items or guests.',
  })
  @ApiCreatedResponse({ type: PaymentDetailResponseDto, description: 'Split payment recorded with item allocations' })
  @ApiStandardErrors(400, 401, 403, 404, 409, 500)
  async createSplitPayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSplitPaymentDto,
  ): Promise<any> {
    return this.paymentService.createSplitPayment(user, dto);
  }

  @Post('discounts/apply')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Cashier] Validate and calculate discount for an amount',
    description: 'Checks promo voucher validity, expiry, and calculates discount deduction for cart subtotal.',
  })
  @ApiOkResponse({ type: DiscountEvaluationResponseDto, description: 'Calculated discount result' })
  @ApiStandardErrors(400, 401, 404, 500)
  async applyDiscount(@Body() dto: ApplyDiscountDto): Promise<DiscountEvaluationResponseDto> {
    return this.paymentService.applyDiscount(dto);
  }

  @Post('discounts/validate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Cashier] Validate discount code and calculate discount amount',
    description: 'Alias for discounts/apply.',
  })
  @ApiOkResponse({ type: DiscountEvaluationResponseDto, description: 'Calculated discount result' })
  @ApiStandardErrors(400, 401, 404, 500)
  async validateDiscount(@Body() dto: ApplyDiscountDto): Promise<DiscountEvaluationResponseDto> {
    return this.paymentService.applyDiscount(dto);
  }

  // ── Stripe Online Payment Flow ───────────────────────────────────────

  @Post('stripe/create-intent')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Create Stripe PaymentIntent',
    description: 'Calculates authoritative order/session balance and generates a Stripe client secret for Stripe Elements.',
  })
  @ApiCreatedResponse({ type: StripePaymentIntentResponseDto, description: 'Stripe PaymentIntent generated' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async createStripePaymentIntent(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateStripePaymentIntentDto,
  ): Promise<StripePaymentIntentResponseDto> {
    return this.paymentService.createStripePaymentIntent(user, dto);
  }

  @Post('stripe/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Authoritatively verify Stripe PaymentIntent',
    description: 'Queries Stripe API to confirm PaymentIntent status and updates payment and order records.',
  })
  @ApiOkResponse({ type: PaymentRecordResponseDto, description: 'Payment verified and settled' })
  @ApiStandardErrors(400, 401, 404, 500)
  async verifyStripePayment(
    @Body() dto: VerifyStripePaymentDto,
  ): Promise<any> {
    return this.paymentService.verifyStripePayment(dto.paymentIntentId);
  }

  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Stripe] Webhook event listener',
    description: 'Receives signed webhook events from Stripe (e.g. payment_intent.succeeded) and performs authoritative settlement.',
  })
  async handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean; processed?: boolean }> {
    const rawBody = req.rawBody || req.body;
    return this.paymentService.handleStripeWebhook(rawBody, signature || '');
  }

  // ── Offline Cashier Payment Flow ─────────────────────────────────────

  @Post('request-offline')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Waiter] Request offline payment (Cash or Card)',
    description: 'Registers an offline payment request for the cashier, transitions session to BILL_REQUESTED, and emits real-time alert.',
  })
  @ApiCreatedResponse({ type: PaymentRecordResponseDto, description: 'Offline payment request registered' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async requestOfflinePayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestOfflinePaymentDto,
  ): Promise<any> {
    return this.paymentService.requestOfflinePayment(user, dto);
  }

  @Get('offline/requests')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PAYMENTS_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Cashier] Get pending offline payment requests',
    description: "Returns all UNPAID offline cash/card payment requests for the staff member's branch.",
  })
  @ApiQuery({ name: 'branchId', required: false, type: String, description: 'Branch UUID' })
  @ApiOkResponse({ type: [OfflinePaymentRequestItemDto], description: 'Pending offline payment requests' })
  @ApiStandardErrors(400, 401, 403, 500)
  async getOfflinePaymentRequests(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId?: string,
  ): Promise<OfflinePaymentRequestItemDto[]> {
    return this.paymentService.getOfflinePaymentRequests(user, branchId);
  }

  @Post('confirm-offline')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PAYMENTS_WRITE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Cashier] Confirm offline payment received (body paymentId)',
    description: 'Cashier authoritatively confirms physical cash receipt or in-person card terminal transaction.',
  })
  @ApiOkResponse({ type: PaymentRecordResponseDto, description: 'Payment marked PAID' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async confirmOfflinePaymentBody(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ConfirmOfflinePaymentDto,
  ): Promise<any> {
    const id = dto.paymentId;
    if (!id) {
      throw new BadRequestException('paymentId is required in body');
    }
    return this.paymentService.confirmOfflinePayment(user, id, user.sub, dto);
  }

  @Post('offline/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PAYMENTS_WRITE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Cashier] Confirm offline payment received (param ID)',
    description: 'Cashier authoritatively confirms physical cash receipt or in-person card terminal transaction.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Payment Request UUID' })
  @ApiOkResponse({ type: PaymentRecordResponseDto, description: 'Payment marked PAID' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async confirmOfflinePayment(
    @Param('id') paymentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ConfirmOfflinePaymentDto,
  ): Promise<any> {
    return this.paymentService.confirmOfflinePayment(user, paymentId, user.sub, dto);
  }

  @Post('reject-offline')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PAYMENTS_WRITE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Cashier] Reject offline payment request (body paymentId)',
    description: 'Cashier rejects or cancels an offline payment request, returning table session to ACTIVE status.',
  })
  @ApiOkResponse({ type: PaymentRecordResponseDto, description: 'Payment marked FAILED' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async rejectOfflinePaymentBody(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectOfflinePaymentDto,
  ): Promise<any> {
    const id = dto.paymentId;
    if (!id) {
      throw new BadRequestException('paymentId is required in body');
    }
    return this.paymentService.rejectOfflinePayment(user, id, user.sub, dto);
  }

  @Post('offline/:id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PAYMENTS_WRITE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Cashier] Reject offline payment request (param ID)',
    description: 'Cashier rejects or cancels an offline payment request, returning table session to ACTIVE status.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Payment Request UUID' })
  @ApiOkResponse({ type: PaymentRecordResponseDto, description: 'Payment marked FAILED' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async rejectOfflinePayment(
    @Param('id') paymentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectOfflinePaymentDto,
  ): Promise<any> {
    return this.paymentService.rejectOfflinePayment(user, paymentId, user.sub, dto);
  }

  // ── Ledger, order, session, then parameterized :id ────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PAYMENTS_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Admin] List customer order payments for an organization or branch',
    description: 'Tenant-scoped ledger of dine-in / QR payments. Distinct from platform SaaS subscription billing.',
  })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'Paginated payment ledger' })
  @ApiStandardErrors(400, 401, 403, 500)
  async listPayments(
    @CurrentUser() user: JwtPayload,
    @Query('organizationId') organizationId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.paymentService.listPayments(user, {
      organizationId,
      branchId,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Cashier] Get payments associated with an order',
    description: 'Lists all payments and transactions registered under a specific order.',
  })
  @ApiParam({ name: 'orderId', type: String, description: 'Order UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: [PaymentRecordResponseDto], description: 'List of order payments' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async getPaymentsByOrder(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ): Promise<any> {
    return this.paymentService.getPaymentsByOrder(user, orderId);
  }

  @Get('session/:sessionId/bill')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Cashier] Calculate bill and outstanding balance for a table session',
    description: 'Consolidates all session orders, taxes, service charges, payments made, and current balance due.',
  })
  @ApiParam({ name: 'sessionId', type: String, description: 'Table Session UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: TableBillCalculationResponseDto, description: 'Consolidated table bill calculation' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async getTableSessionBill(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ): Promise<TableBillCalculationResponseDto> {
    return this.paymentService.calculateTableBill(user, sessionId);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PAYMENTS_REFUND)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Manager/Cashier] Refund a payment',
    description: 'Executes full or partial refund on a paid transaction, updating session and order balances.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Payment UUID', example: '55667788-99aa-bbcc-ddee-112233445566' })
  @ApiOkResponse({ type: PaymentRecordResponseDto, description: 'Payment refunded' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async refundPayment(
    @CurrentUser() user: JwtPayload,
    @Param('id') paymentId: string,
    @Body() dto: RefundPaymentDto,
  ): Promise<any> {
    return this.paymentService.refundPayment(user, paymentId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer/Cashier] Get payment receipt by payment ID',
    description: 'Returns receipt details with line-item allocation breakdown and transaction reference.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Payment UUID', example: '55667788-99aa-bbcc-ddee-112233445566' })
  @ApiOkResponse({ type: PaymentDetailResponseDto, description: 'Payment receipt with transaction details' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async getPayment(
    @CurrentUser() user: JwtPayload,
    @Param('id') paymentId: string,
  ): Promise<any> {
    return this.paymentService.getPayment(user, paymentId);
  }
}
