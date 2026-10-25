import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export class SubmitFeedbackDto {
  @ApiProperty({
    description: 'Order UUID this feedback belongs to',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @IsUUID()
  orderId!: string;

  @ApiProperty({
    description: 'Star rating 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Optional text comment or customer compliments',
    example: 'Amazing food and lightning-fast service!',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Optional customer UUID if authenticated',
    example: '11223344-5566-7788-99aa-bbccddeeff00',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}

export class FeedbackResponseDto {
  @ApiProperty({
    example: '77665544-3322-1100-aa99-887766554433',
    description: 'Review UUID',
  })
  id!: string;

  @ApiProperty({
    example: '8877332f-4512-40bc-8012-d881e6e58003',
    description: 'Order UUID',
  })
  orderId!: string;

  @ApiProperty({
    example: '11223344-5566-7788-99aa-bbccddeeff00',
    description: 'Customer UUID',
  })
  customerId!: string;

  @ApiProperty({
    example: 5,
    description: 'Star rating recorded',
  })
  rating!: number;

  @ApiPropertyOptional({
    example: 'Amazing food and lightning-fast service!',
    description: 'Customer comment',
  })
  comment!: string | null;

  @ApiProperty({
    example: '2026-10-08T14:40:00.000Z',
    description: 'Submission timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    example: 'Your feedback was submitted successfully.',
    description: 'Feedback confirmation message',
  })
  message!: string;
}
