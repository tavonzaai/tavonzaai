import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsIn } from 'class-validator';

export class SendTestEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Target email recipient (ensure this address is verified if SES is in sandbox mode)',
  })
  @IsEmail()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({
    example: 'Tavonza AI Local Test Email',
    required: false,
    description: 'Custom subject line',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    example: 'Testing AWS SES email integration from local Swagger UI!',
    required: false,
    description: 'Custom body text or HTML',
  })
  @IsString()
  @IsOptional()
  message?: string;
}

export class SendTestOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Target email recipient',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    enum: ['email_verification', 'password_reset'],
    example: 'email_verification',
    description: 'Purpose of the OTP email',
  })
  @IsIn(['email_verification', 'password_reset'])
  type!: 'email_verification' | 'password_reset';
}

export class SendMailResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'queued-job-1' })
  messageId?: string;

  @ApiProperty({ example: true, description: 'True if pushed to Redis FIFO queue, false if dispatched directly' })
  queued!: boolean;

  @ApiProperty({ required: false, example: '48291', description: 'Development OTP preview for quick testing' })
  devOtp?: string;

  @ApiProperty({ required: false })
  error?: string;
}

export class MailStatusResponseDto {
  @ApiProperty({ example: 'development' })
  environment!: string;

  @ApiProperty({ example: 'eu-west-2' })
  awsRegion!: string;

  @ApiProperty({ example: true })
  redisConfigured!: boolean;

  @ApiProperty({ example: 'connected' })
  queueStatus!: string;

  @ApiProperty({ required: false })
  jobCounts?: Record<string, number> | null;

  @ApiProperty({ example: 'noreply@tavonza.com' })
  defaultFrom!: string;
}
