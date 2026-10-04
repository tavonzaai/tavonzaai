import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { PaymentService } from '../application/payment.service';
import {
  CreatePaymentDto,
  CreateSplitPaymentDto,
  ApplyDiscountDto,
  RefundPaymentDto,
} from './http/dto/payment.dto';

@ApiTags('Payments & Billing')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('options')
  @ApiOperation({ summary: 'Get available payment methods' })
  @ApiOkResponse({ description: 'List of payment methods' })
  async getOptions(@Query('branchId') branchId?: string) {
    return this.paymentService.getPaymentOptions(branchId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process payment (single order or table session)' })
  @ApiCreatedResponse({ description: 'Payment recorded and marked PAID' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Post('split')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process split payment with line item or guest allocations' })
  @ApiCreatedResponse({ description: 'Split payment processed' })
  async createSplitPayment(@Body() dto: CreateSplitPaymentDto) {
    return this.paymentService.createSplitPayment(dto);
  }

  @Post('discounts/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and calculate discount for an amount' })
  @ApiOkResponse({ description: 'Calculated discount result' })
  async applyDiscount(@Body() dto: ApplyDiscountDto) {
    return this.paymentService.applyDiscount(dto);
  }

  @Post('discounts/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate discount code and calculate discount amount' })
  @ApiOkResponse({ description: 'Calculated discount result' })
  async validateDiscount(@Body() dto: ApplyDiscountDto) {
    return this.paymentService.applyDiscount(dto);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiOkResponse({ description: 'Payment refunded' })
  async refundPayment(
    @Param('id') paymentId: string,
    @Body() dto: RefundPaymentDto
  ) {
    return this.paymentService.refundPayment(paymentId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment receipt by payment ID' })
  @ApiOkResponse({ description: 'Payment receipt with transaction details' })
  async getPayment(@Param('id') paymentId: string) {
    return this.paymentService.getPayment(paymentId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments associated with an order' })
  @ApiOkResponse({ description: 'List of order payments' })
  async getPaymentsByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentsByOrder(orderId);
  }

  @Get('session/:sessionId/bill')
  @ApiOperation({ summary: 'Calculate bill and outstanding balance for a table session' })
  @ApiOkResponse({ description: 'Session bill calculation' })
  async getTableSessionBill(@Param('sessionId') sessionId: string) {
    return this.paymentService.calculateTableBill(sessionId);
  }
}
