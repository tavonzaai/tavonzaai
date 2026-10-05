import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { InternalServiceGuard } from '../../../../common/guards/internal-service.guard';
import { InternalAiService } from '../../application/internal-ai.service';
import {
  ResolveActorRequestDto,
  ToolExecutionRequestDto,
  ToolConfirmationRequestDto,
  InternalAuditRequestDto,
} from './dto/internal-ai.dto';

@ApiTags('Internal | AI Agent Tool Gateway')
@ApiSecurity('InternalServiceToken')
@UseGuards(InternalServiceGuard)
@Controller('internal')
export class InternalAiController {
  constructor(private readonly aiService: InternalAiService) {}

  /**
   * Route 1: POST /internal/auth/resolve-actor
   * Resolves an incoming end-user / customer JWT into a validated ActorContext
   */
  @Post('auth/resolve-actor')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve client JWT token to ActorContext' })
  @ApiOkResponse({ description: 'Validated actor context' })
  async resolveActor(@Body() dto: ResolveActorRequestDto) {
    return this.aiService.resolveActor(dto.token);
  }

  /**
   * Route 2: GET /internal/context/bootstrap
   * Returns snapshot of active tables and operational sessions
   */
  @Get('context/bootstrap')
  @ApiOperation({ summary: 'Bootstrap context for active tables and sessions' })
  @ApiOkResponse({ description: 'Bootstrap context snapshot' })
  async bootstrapContext(
    @Query('actor_id') actorId: string,
    @Query('branch_id') branchId: string
  ) {
    return this.aiService.bootstrapContext(actorId, branchId);
  }

  /**
   * Route 3: POST /internal/tools/execute
   * The central Tool Gateway executing the 8 approved domain tools
   */
  @Post('tools/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute approved domain tool with actor authorization' })
  @ApiOkResponse({ description: 'Tool execution result' })
  async executeTool(@Body() dto: ToolExecutionRequestDto) {
    return this.aiService.executeTool(dto);
  }

  /**
   * Route 4: POST /internal/tools/execute/confirm
   * Confirmation handshake for sensitive mutations
   */
  @Post('tools/execute/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm sensitive tool mutation' })
  @ApiOkResponse({ description: 'Confirmation result' })
  async confirmTool(@Body() dto: ToolConfirmationRequestDto) {
    return this.aiService.confirmToolExecution(dto);
  }

  /**
   * Route 5: POST /internal/audit
   * Ingests structured AI action events into audit log
   */
  @Post('audit')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Ingest AI action into platform audit trail' })
  @ApiOkResponse({ description: 'Audit event accepted' })
  async recordAudit(@Body() dto: InternalAuditRequestDto) {
    return this.aiService.recordAudit(dto);
  }
}
