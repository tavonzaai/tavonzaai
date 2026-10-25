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

// ── Response DTOs ─────────────────────────────────────────────────────

export class ActorContextResponseDto {
  @ApiProperty({ example: 'USER', description: 'Actor classification (USER, AI_AGENT, SYSTEM, INTEGRATION)' })
  actor_type!: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef', description: 'Acting user UUID' })
  acting_user_id!: string;

  @ApiProperty({ example: 'customer_ai_v1', description: 'AI agent personality identifier' })
  ai_agent_id!: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Organization UUID' })
  organization_id?: string;

  @ApiPropertyOptional({ example: null, description: 'Restaurant UUID if assigned' })
  restaurantId?: string | null;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branch_id!: string;

  @ApiProperty({ example: ['menu.read', 'tables.read', 'orders.read', 'payments.read'], description: 'Assigned tool capabilities' })
  permissions!: string[];

  @ApiPropertyOptional({ example: { tables: ['T-1', 'T-2'] }, description: 'Granular resource scopes' })
  resource_scope?: Record<string, any>;
}

export class ActiveSessionSummaryDto {
  @ApiProperty({ example: 'c0e1d2c3-4567-89ab-cdef-0123456789ab', description: 'Session UUID' })
  id!: string;

  @ApiProperty({ example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef', description: 'Table UUID' })
  table_id!: string;

  @ApiProperty({ example: 'active', description: 'Status summary' })
  status!: string;
}

export class BootstrapContextResponseDto {
  @ApiProperty({ example: ['T-1', 'T-2', 'T-3', 'T-4'], description: 'Tables in branch' })
  assigned_tables!: string[];

  @ApiProperty({ type: [ActiveSessionSummaryDto], description: 'Active dining sessions in branch' })
  active_sessions!: ActiveSessionSummaryDto[];
}

export class ToolExecutionResponseDto {
  @ApiProperty({ example: true, description: 'Whether tool execution succeeded' })
  ok!: boolean;

  @ApiPropertyOptional({ description: 'Tool output payload' })
  data?: any;

  @ApiPropertyOptional({ example: 'Permission denied', description: 'Error explanation if ok is false' })
  error?: string;
}

export class ToolConfirmationResponseDto {
  @ApiProperty({ example: true, description: 'Confirmation status' })
  ok!: boolean;

  @ApiProperty({
    example: { confirmed: true, executed_action: 'confirmed_action', pending_confirmation_id: 'conf_771829' },
    description: 'Confirmation execution payload'
  })
  data!: {
    confirmed: boolean;
    executed_action: string;
    pending_confirmation_id: string;
  };
}

export class InternalAuditResponseDto {
  @ApiProperty({ example: true, description: 'Audit record accepted flag' })
  ok!: boolean;
}

