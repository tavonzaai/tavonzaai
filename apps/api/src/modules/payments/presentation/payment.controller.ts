import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
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
import { PaymentService } from '../application/payment.service';
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
} from './http/dto/payment.dto';
import { ApiStandardErrors } from '../../../common/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

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
  @ApiOperation({
    summary: '[Customer/Cashier] Process payment',
    description: 'Processes a single payment for an entire order or table session, with optional promo discount voucher.',
  })
  @ApiCreatedResponse({ type: PaymentRecordResponseDto, description: 'Payment recorded and marked PAID' })
  @ApiStandardErrors(400, 404, 409, 500)
  async createPayment(@Body() dto: CreatePaymentDto): Promise<any> {
    return this.paymentService.createPayment(dto);
  }

  @Post('split')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Customer/Cashier] Process split payment',
    description: 'Processes itemized or equal split payment allocation across specific line items or guests.',
  })
  @ApiCreatedResponse({ type: PaymentDetailResponseDto, description: 'Split payment recorded with item allocations' })
  @ApiStandardErrors(400, 404, 409, 500)
  async createSplitPayment(@Body() dto: CreateSplitPaymentDto): Promise<any> {
    return this.paymentService.createSplitPayment(dto);
  }

  @Post('discounts/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Customer/Cashier] Validate and calculate discount for an amount',
    description: 'Checks promo voucher validity, expiry, and calculates discount deduction for cart subtotal.',
  })
  @ApiOkResponse({ type: DiscountEvaluationResponseDto, description: 'Calculated discount result' })
  @ApiStandardErrors(400, 404, 500)
  async applyDiscount(@Body() dto: ApplyDiscountDto): Promise<DiscountEvaluationResponseDto> {
    return this.paymentService.applyDiscount(dto);
  }

  @Post('discounts/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Customer/Cashier] Validate discount code and calculate discount amount',
    description: 'Alias for discounts/apply.',
  })
  @ApiOkResponse({ type: DiscountEvaluationResponseDto, description: 'Calculated discount result' })
  @ApiStandardErrors(400, 404, 500)
  async validateDiscount(@Body() dto: ApplyDiscountDto): Promise<DiscountEvaluationResponseDto> {
    return this.paymentService.applyDiscount(dto);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Manager/Cashier] Refund a payment',
    description: 'Executes full or partial refund on a paid transaction, updating session and order balances.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Payment UUID', example: '55667788-99aa-bbcc-ddee-112233445566' })
  @ApiOkResponse({ type: PaymentRecordResponseDto, description: 'Payment refunded' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async refundPayment(
    @Param('id') paymentId: string,
    @Body() dto: RefundPaymentDto,
  ): Promise<any> {
    return this.paymentService.refundPayment(paymentId, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '[Customer/Cashier] Get payment receipt by payment ID',
    description: 'Returns receipt details with line-item allocation breakdown and transaction reference.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Payment UUID', example: '55667788-99aa-bbcc-ddee-112233445566' })
  @ApiOkResponse({ type: PaymentDetailResponseDto, description: 'Payment receipt with transaction details' })
  @ApiStandardErrors(400, 404, 500)
  async getPayment(@Param('id') paymentId: string): Promise<any> {
    return this.paymentService.getPayment(paymentId);
  }

  @Get('order/:orderId')
  @ApiOperation({
    summary: '[Customer/Cashier] Get payments associated with an order',
    description: 'Lists all payments and transactions registered under a specific order.',
  })
  @ApiParam({ name: 'orderId', type: String, description: 'Order UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: [PaymentRecordResponseDto], description: 'List of order payments' })
  @ApiStandardErrors(400, 404, 500)
  async getPaymentsByOrder(@Param('orderId') orderId: string): Promise<any> {
    return this.paymentService.getPaymentsByOrder(orderId);
  }

  @Get('session/:sessionId/bill')
  @ApiOperation({
    summary: '[Customer/Cashier] Calculate bill and outstanding balance for a table session',
    description: 'Consolidates all session orders, taxes, service charges, payments made, and current balance due.',
  })
  @ApiParam({ name: 'sessionId', type: String, description: 'Table Session UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: TableBillCalculationResponseDto, description: 'Consolidated table bill calculation' })
  @ApiStandardErrors(400, 404, 500)
  async getTableSessionBill(@Param('sessionId') sessionId: string): Promise<TableBillCalculationResponseDto> {
    return this.paymentService.calculateTableBill(sessionId);
  }
}
