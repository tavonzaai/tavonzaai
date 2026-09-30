// ============================================================================
// Payments Controller
// ============================================================================
//
// Figma Screens:
//   "Payment option"    → GET  /payments/options?branchId=
//   "Complete Payment"  → POST /payments
//   "Thank you!" receipt → GET /payments/:paymentId
// ============================================================================

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
  ApiProperty,
} from '@nestjs/swagger';
import { PaymentService } from '../application/payment.service';

// ── DTOs ──────────────────────────────────────────────────────────────

class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID to pay for' })
  orderId!: string;

  @ApiProperty({ enum: ['card', 'cash', 'qr', 'split'] })
  method!: 'card' | 'cash' | 'qr' | 'split';

  @ApiProperty({ description: 'Total amount to charge', example: 30.50 })
  amount!: number;

  @ApiProperty({ required: false, default: 'USD' })
  currency?: string;

  @ApiProperty({ required: false, description: 'Table session ID' })
  tableSessionId?: string;

  @ApiProperty({ required: false, description: 'Customer session ID' })
  customerSessionId?: string;

  // Figma: Card fields (last 4 only — NEVER store full card number)
  @ApiProperty({ required: false, description: 'Last 4 digits of card', example: '5678' })
  cardLast4?: string;

  @ApiProperty({ required: false, description: 'Cardholder name from card', example: 'Amanda' })
  cardholderName?: string;
}

// ── Controller ────────────────────────────────────────────────────────

@ApiTags('Customer | Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * GET /payments/options?branchId=
   * Figma: "Payment option" screen
   * Returns available payment methods (card, cash, QR)
   */
  @Get('options')
  @ApiOperation({ summary: '[Customer] Get available payment methods for a branch' })
  @ApiOkResponse({ description: 'List of payment methods' })
  async getOptions(@Query('branchId') branchId: string) {
    return this.paymentService.getPaymentOptions(branchId);
  }

  /**
   * POST /payments
   * Figma: "Complete Payment" → card fields → "Pay" button
   * Returns payment record with transactionId for receipt screen
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Customer] Process payment for an order' })
  @ApiCreatedResponse({ description: 'Payment processed — use paymentId for receipt' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  /**
   * GET /payments/:paymentId
   * Figma: "Thank you! Your transaction was successful" receipt screen
   * Shows: transactionId (#ID-...), date, time, total, "PAID" badge
   */
  @Get(':paymentId')
  @ApiOperation({ summary: '[Customer] Get payment receipt — shown on Thank You screen' })
  @ApiOkResponse({ description: 'Payment receipt with transaction details' })
  async getPayment(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPayment(paymentId);
  }

  /**
   * GET /payments/order/:orderId
   * Get payment for a specific order
   */
  @Get('order/:orderId')
  @ApiOperation({ summary: '[Customer] Get payment by order ID' })
  async getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrder(orderId);
  }
}
