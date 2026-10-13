import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

// ── Request DTOs ──────────────────────────────────────────────────────

export class ScanQrDto {
  @ApiProperty({ description: 'Branch UUID decoded from physical QR code', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table UUID decoded from physical QR code', example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Human-readable table number label', example: 'Table 08' })
  @IsString()
  @IsNotEmpty()
  tableNumber!: string;

  @ApiPropertyOptional({ description: 'Optional display name for customer', example: 'Alex' })
  @IsOptional()
  @IsString()
  displayName?: string;
}

export class JoinSessionDto {
  @ApiProperty({ description: '6-character alphanumeric join code from host', example: 'K8M9QX' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Display name for joining guest', example: 'Jordan' })
  @IsOptional()
  @IsString()
  displayName?: string;
}

export class OrderModeDto {
  @ApiProperty({ enum: ['individual', 'together'], description: 'Ordering mode', example: 'individual' })
  @IsIn(['individual', 'together'])
  orderMode!: 'individual' | 'together';

  @ApiProperty({ description: 'Customer guest session UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  customerSessionId!: string;
}

export class RequestTableOtpDto {
  @ApiProperty({ description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table UUID', example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Customer phone number or email address', example: '+14155552671' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiPropertyOptional({ description: 'Optional Table Session UUID if joining active table', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @IsOptional()
  @IsUUID()
  tableSessionId?: string;
}

export class VerifyTableOtpDto {
  @ApiProperty({ description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table UUID', example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Customer phone number or email address', example: '+14155552671' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiProperty({ description: '5-digit verification code', example: '48291' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Optional guest display name', example: 'Alex Morgan' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Optional human-readable table number label', example: 'Table 08' })
  @IsOptional()
  @IsString()
  tableNumber?: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────

export class TableSessionRecordDto {
  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Table Session UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Table UUID' })
  tableId!: string;

  @ApiProperty({ example: 'K8M9QX', description: 'Active 6-char share code for group dining' })
  joinCode!: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'PAYMENT_PENDING', 'CLOSED', 'ABANDONED'], description: 'Session lifecycle status' })
  status!: string;

  @ApiProperty({ example: '2026-10-08T14:30:00.000Z', description: 'Session creation timestamp' })
  createdAt!: Date;
}

export class GuestSessionRecordDto {
  @ApiProperty({ example: '11223344-5566-7788-99aa-bbccddeeff00', description: 'Guest Session UUID' })
  id!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Associated Table Session UUID' })
  tableSessionId!: string;

  @ApiProperty({ example: 'Alex', description: 'Guest display nickname' })
  displayName!: string;

  @ApiPropertyOptional({ example: '+14155552671', description: 'Customer contact phone/email' })
  contact?: string | null;

  @ApiProperty({ example: true, description: 'True if this guest opened the session as host' })
  isHostGuest!: boolean;

  @ApiProperty({ example: 'ACTIVE', description: 'Guest status' })
  status!: string;
}

export class TableOtpRequestResponseDto {
  @ApiProperty({ example: true, description: 'Success flag' })
  success!: boolean;

  @ApiProperty({ example: 'Verification code sent', description: 'Operation message' })
  message!: string;

  @ApiPropertyOptional({ example: '48291', description: 'Dev OTP code for automated/Swagger testing (non-prod only)' })
  devOtp?: string;
}

export class TableOtpVerifyResponseDto {
  @ApiProperty({ type: TableSessionRecordDto, description: 'Active table session entity' })
  session!: TableSessionRecordDto;

  @ApiProperty({ type: GuestSessionRecordDto, description: 'Verified guest session entity' })
  guestSession!: GuestSessionRecordDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT authentication token for customer API operations' })
  accessToken!: string;

  @ApiProperty({ example: true, description: 'Whether the verified guest is host of table' })
  isHost!: boolean;
}

export class ScanQrResponseDto {
  @ApiProperty({ type: TableSessionRecordDto, description: 'Active or newly created table session' })
  session!: TableSessionRecordDto;

  @ApiProperty({ type: GuestSessionRecordDto, description: 'Guest session created or matched' })
  guestSession!: GuestSessionRecordDto;

  @ApiProperty({ example: true, description: 'True if a new session was created upon scanning' })
  isNew!: boolean;
}

export class SessionDetailResponseDto {
  @ApiProperty({ type: TableSessionRecordDto, description: 'Table session record' })
  session!: TableSessionRecordDto;

  @ApiProperty({ type: [GuestSessionRecordDto], description: 'List of all guests currently seated at table' })
  guests!: GuestSessionRecordDto[];
}

export class ShareCodeResponseDto {
  @ApiProperty({ example: 'K8M9QX', description: 'Active 6-character join code' })
  joinCode!: string;

  @ApiProperty({ example: 'https://app.tavonza.ai/join?code=K8M9QX', description: 'Direct web URL for companions to join this table' })
  shareUrl!: string;
}

export class SessionActionResponseDto {
  @ApiProperty({ example: true, description: 'Success flag' })
  success!: boolean;

  @ApiProperty({ example: 'Operation completed successfully', description: 'Action feedback message' })
  message!: string;
}
