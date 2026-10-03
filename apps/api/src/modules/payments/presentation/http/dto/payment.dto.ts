import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
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
  @IsEnum(PAYMENT_SCOPES)
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
  @IsEnum(PAYMENT_METHODS)
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
  @IsEnum(PAYMENT_METHODS)
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
