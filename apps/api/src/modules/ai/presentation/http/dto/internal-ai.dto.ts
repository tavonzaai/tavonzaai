import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class ResolveActorRequestDto {
  @ApiProperty({ description: 'JWT bearer token to resolve into actor context' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ToolExecutionRequestDto {
  @ApiProperty({ description: 'Name of the approved domain tool', example: 'get_menu' })
  @IsString()
  @IsNotEmpty()
  tool!: string;

  @ApiPropertyOptional({ description: 'Tool arguments' })
  @IsOptional()
  @IsObject()
  args?: Record<string, any>;

  @ApiProperty({ description: 'Execution scope (branch/org)' })
  @IsObject()
  scope!: {
    organization_id?: string;
    branch_id: string;
  };

  @ApiProperty({ description: 'Calling actor identity & permissions' })
  @IsObject()
  actor!: {
    actor_type: 'USER' | 'AI_AGENT' | 'SYSTEM' | 'INTEGRATION';
    acting_user_id?: string | null;
    organization_id?: string;
    branch_id: string;
    permissions: string[];
  };
}

export class ToolConfirmationRequestDto {
  @ApiProperty({ description: 'Pending mutation confirmation ID', example: 'conf_771829' })
  @IsString()
  @IsNotEmpty()
  pending_confirmation_id!: string;

  @ApiProperty({ description: 'Actor confirming the action' })
  @IsObject()
  actor!: {
    actor_type: string;
    acting_user_id?: string | null;
    organization_id?: string;
    branch_id?: string;
  };
}

export class InternalAuditRequestDto {
  @ApiProperty({ example: 'USER' })
  @IsString()
  actorType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actingUserId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aiAgentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  restaurantId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string | null;

  @ApiProperty({ example: 'get_menu' })
  @IsString()
  action!: string;

  @ApiPropertyOptional()
  @IsOptional()
  resource?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  before?: Record<string, any> | null;

  @ApiPropertyOptional()
  @IsOptional()
  after?: Record<string, any> | null;

  @ApiProperty({ example: 'ALLOW' })
  @IsString()
  authorizationResult!: string;

  @ApiProperty({ example: '2026-10-04T09:20:00.000Z' })
  @IsString()
  timestamp!: string;

  @ApiProperty({ example: 'tavonza-ai' })
  @IsString()
  source!: string;
}
