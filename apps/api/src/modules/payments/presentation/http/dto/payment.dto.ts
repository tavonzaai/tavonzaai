import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  PaymentMethod,
  PaymentScope,
} from '../../../domain/entities/payment.entity';

const PAYMENT_METHODS: PaymentMethod[] = [
  'CASH',
  'CARD',
  'MOBILE_WALLET',
  'ONLINE_GATEWAY',
];

const PAYMENT_SCOPES: PaymentScope[] = [
  'ORDER',
  'ORDER_ITEMS',
  'GUEST_SESSION',
  'TABLE_SESSION',
];

export class CreatePaymentDto {
  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Table session ID' })
  @IsOptional()
  @IsUUID()
  tableSessionId?: string;

  @ApiPropertyOptional({ description: 'Payer guest session ID' })
  @IsOptional()
  @IsUUID()
  payerGuestSessionId?: string;

  @ApiPropertyOptional({ description: 'List of guest session IDs being paid for' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  paidForGuestIds?: string[];

  @ApiProperty({ enum: PAYMENT_SCOPES, example: 'ORDER' })
  @IsIn(PAYMENT_SCOPES)
  scope!: PaymentScope;

  @ApiProperty({ description: 'Payment amount', example: 45.5 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ description: 'Tip amount', example: 5.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;

  @ApiProperty({ enum: PAYMENT_METHODS, example: 'CARD' })
  @IsIn(PAYMENT_METHODS)
  method!: PaymentMethod;

  @ApiPropertyOptional({ description: 'Discount code applied', example: 'PROMO10' })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiPropertyOptional({ description: 'External transaction reference' })
  @IsOptional()
  @IsString()
  transactionRef?: string;
}

export class SplitAllocationDto {
  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Order Item ID' })
  @IsOptional()
  @IsUUID()
  orderItemId?: string;

  @ApiProperty({ description: 'Amount allocated', example: 15.0 })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class CreateSplitPaymentDto {
  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Table Session ID' })
  @IsOptional()
  @IsUUID()
  tableSessionId?: string;

  @ApiPropertyOptional({ description: 'Payer Guest Session ID' })
  @IsOptional()
  @IsUUID()
  payerGuestSessionId?: string;

  @ApiProperty({ enum: PAYMENT_METHODS, example: 'CARD' })
  @IsIn(PAYMENT_METHODS)
  method!: PaymentMethod;

  @ApiProperty({ type: [SplitAllocationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitAllocationDto)
  allocations!: SplitAllocationDto[];

  @ApiPropertyOptional({ description: 'Tip amount', example: 3.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;

  @ApiPropertyOptional({ description: 'Transaction reference' })
  @IsOptional()
  @IsString()
  transactionRef?: string;
}

export class ApplyDiscountDto {
  @ApiProperty({ description: 'Discount promo code', example: 'WELCOME10' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Subtotal to evaluate discount against', example: 50.0 })
  @IsNumber()
  @Min(0)
  subtotal!: number;
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Amount to refund', example: 10.0 })
  @IsNumber()
  @Min(0.01)
  refundAmount!: number;

  @ApiProperty({ description: 'Refund reason/reference', example: 'Item was unavailable' })
  @IsString()
  reason!: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────

export class PaymentOptionItemDto {
  @ApiProperty({ example: 'CARD', description: 'Payment method key' })
  id!: string;

  @ApiProperty({ example: 'Credit / Debit Card', description: 'Method label' })
  label!: string;

  @ApiProperty({ example: 'card', description: 'Icon identifier' })
  icon!: string;
}

export class PaymentOptionsResponseDto {
  @ApiProperty({ type: [PaymentOptionItemDto], description: 'List of supported payment methods' })
  methods!: PaymentOptionItemDto[];
}

export class PaymentAllocationItemDto {
  @ApiProperty({ example: 'bbcc3344-5566-7788-99aa-112233445566', description: 'Allocation UUID' })
  id!: string;

  @ApiPropertyOptional({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID' })
  orderId?: string | null;

  @ApiPropertyOptional({ example: '9988443e-1122-43bb-a123-f992a7a69004', description: 'Order Item UUID' })
  orderItemId?: string | null;

  @ApiProperty({ example: 15.00, description: 'Allocated amount' })
  amount!: number;
}

export class PaymentRecordResponseDto {
  @ApiProperty({ example: '55667788-99aa-bbcc-ddee-112233445566', description: 'Payment transaction UUID' })
  id!: string;

  @ApiPropertyOptional({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID' })
  orderId?: string | null;

  @ApiPropertyOptional({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Table session UUID' })
  tableSessionId?: string | null;

  @ApiPropertyOptional({ example: '11223344-5566-7788-99aa-bbccddeeff00', description: 'Payer guest session UUID' })
  payerGuestSessionId?: string | null;

  @ApiProperty({ example: 'ORDER', enum: PAYMENT_SCOPES, description: 'Payment scope' })
  scope!: string;

  @ApiProperty({ example: 36.80, description: 'Paid monetary amount' })
  amount!: number;

  @ApiProperty({ example: 5.00, description: 'Optional gratuity tip amount' })
  tipAmount!: number;

  @ApiProperty({ example: 'PAID', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_PAID'], description: 'Payment status' })
  status!: string;

  @ApiProperty({ example: 'CARD', enum: PAYMENT_METHODS, description: 'Payment method utilized' })
  method!: string;

  @ApiProperty({ example: 'TX-172839281-4829', description: 'External or internal transaction reference code' })
  transactionRef!: string;

  @ApiProperty({ example: '2026-10-08T14:42:00.000Z', description: 'Payment creation timestamp' })
  createdAt!: Date;
}

export class PaymentDetailResponseDto extends PaymentRecordResponseDto {
  @ApiProperty({ type: [PaymentAllocationItemDto], description: 'Detailed allocation breakdown across items/orders' })
  allocations!: PaymentAllocationItemDto[];
}

export class DiscountEvaluationResponseDto {
  @ApiProperty({ example: 'WELCOME10', description: 'Promo coupon code' })
  code!: string;

  @ApiProperty({ example: 'PERCENTAGE', enum: ['PERCENTAGE', 'FIXED'], description: 'Discount calculation type' })
  type!: string;

  @ApiProperty({ example: 5.00, description: 'Monetary discount subtracted' })
  discountAmount!: number;

  @ApiProperty({ example: 50.00, description: 'Original subtotal evaluated' })
  subtotal!: number;

  @ApiProperty({ example: 45.00, description: 'Net total balance after discount subtracted' })
  netTotal!: number;
}

export class TableBillCalculationResponseDto {
  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Table session UUID' })
  tableSessionId!: string;

  @ApiProperty({ example: 2, description: 'Total orders placed in this session' })
  ordersCount!: number;

  @ApiProperty({ example: 70.00, description: 'Net dishes subtotal' })
  subtotal!: number;

  @ApiProperty({ example: 3.50, description: 'Total tax calculated' })
  taxAmount!: number;

  @ApiProperty({ example: 7.00, description: 'Total service fee calculated' })
  serviceCharge!: number;

  @ApiProperty({ example: 80.50, description: 'Total bill due' })
  totalAmount!: number;

  @ApiProperty({ example: 40.00, description: 'Cumulative amount paid across all guest transactions' })
  paidAmount!: number;

  @ApiProperty({ example: 40.50, description: 'Outstanding balance required to close table' })
  balanceDue!: number;

  @ApiProperty({ example: false, description: 'True if totalAmount > 0 and balanceDue == 0' })
  isFullyPaid!: boolean;
}

// ── Stripe & Offline Workflow DTOs ────────────────────────────────────

export class CreateStripePaymentIntentDto {
  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Table session ID' })
  @IsOptional()
  @IsUUID()
  tableSessionId?: string;

  @ApiPropertyOptional({ description: 'Payer guest session ID' })
  @IsOptional()
  @IsUUID()
  payerGuestSessionId?: string;

  @ApiPropertyOptional({ description: 'Tip amount', example: 5.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;

  @ApiPropertyOptional({ description: 'Discount promo code', example: 'WELCOME10' })
  @IsOptional()
  @IsString()
  discountCode?: string;
}

export class StripePaymentIntentResponseDto {
  @ApiProperty({ description: 'Stripe client secret for Stripe Elements' })
  clientSecret!: string;

  @ApiProperty({ description: 'Stripe PaymentIntent ID' })
  paymentIntentId!: string;

  @ApiProperty({ description: 'Chargeable amount in currency units' })
  amount!: number;

  @ApiProperty({ description: 'ISO Currency code', example: 'USD' })
  currency!: string;

  @ApiProperty({ description: 'Stripe publishable key' })
  publishableKey!: string;

  @ApiPropertyOptional({ description: 'Associated order ID' })
  orderId?: string | null;

  @ApiPropertyOptional({ description: 'Associated table session ID' })
  tableSessionId?: string | null;
}

export class VerifyStripePaymentDto {
  @ApiProperty({ description: 'Stripe PaymentIntent ID to verify' })
  @IsString()
  paymentIntentId!: string;
}

export class RequestOfflinePaymentDto {
  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Table session ID' })
  @IsOptional()
  @IsUUID()
  tableSessionId?: string;

  @ApiPropertyOptional({ description: 'Payer guest session ID' })
  @IsOptional()
  @IsUUID()
  payerGuestSessionId?: string;

  @ApiProperty({ enum: ['CASH', 'CARD'], example: 'CASH', description: 'Offline payment method' })
  @IsIn(['CASH', 'CARD'])
  method!: 'CASH' | 'CARD';

  @ApiPropertyOptional({ description: 'Tip amount', example: 2.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;

  @ApiPropertyOptional({ description: 'Discount promo code' })
  @IsOptional()
  @IsString()
  discountCode?: string;
}

export class ConfirmOfflinePaymentDto {
  @ApiPropertyOptional({ description: 'Payment Request UUID (if passing in body)', example: '55667788-99aa-bbcc-ddee-112233445566' })
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @ApiPropertyOptional({ description: 'Received amount', example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  receivedAmount?: number;

  @ApiPropertyOptional({ description: 'Tip amount', example: 5.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;
}

export class RejectOfflinePaymentDto {
  @ApiPropertyOptional({ description: 'Payment Request UUID (if passing in body)', example: '55667788-99aa-bbcc-ddee-112233445566' })
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @ApiProperty({ description: 'Rejection reason', example: 'Customer cancelled offline payment request' })
  @IsString()
  reason!: string;
}

export class OfflinePaymentRequestItemDto {
  @ApiProperty({ example: '55667788-99aa-bbcc-ddee-112233445566', description: 'Payment record ID' })
  id!: string;

  @ApiPropertyOptional({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order ID' })
  orderId?: string | null;

  @ApiPropertyOptional({ example: 'ORD-10590', description: 'Order number' })
  orderNumber?: string;

  @ApiPropertyOptional({ example: '11223344-5566-7788-99aa-bbccddeeff00', description: 'Table ID' })
  tableId?: string | null;

  @ApiPropertyOptional({ example: 'Table 08', description: 'Table label' })
  tableLabel?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Customer or guest name' })
  customerName?: string;

  @ApiPropertyOptional({ description: 'Table session ID' })
  tableSessionId?: string | null;

  @ApiPropertyOptional({ description: 'Payer guest session ID' })
  payerGuestSessionId?: string | null;

  @ApiProperty({ example: 45.5, description: 'Payable amount' })
  amount!: number;

  @ApiProperty({ example: 5.0, description: 'Tip amount' })
  tipAmount!: number;

  @ApiProperty({ example: 'CASH', enum: ['CASH', 'CARD'] })
  method!: string;

  @ApiPropertyOptional({ example: '55667788-99aa-bbcc-ddee-112233445566', description: 'Payment record ID' })
  paymentId?: string;

  @ApiProperty({ example: 'UNPAID', description: 'Current status' })
  status!: string;

  @ApiProperty({ example: 'REQ-172839281-4829', description: 'Reference' })
  transactionRef!: string;

  @ApiProperty({ description: 'Request timestamp' })
  createdAt!: Date;
}
