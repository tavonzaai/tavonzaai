import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { OrganizationService } from '../../application/services/organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  OrganizationPaginatedResponseDto,
  QueryOrganizationDto,
} from './dto/organization.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Core | Organization Management')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiCreatedResponse({ description: 'Organization created successfully', type: OrganizationResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.orgService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List organizations with search, sorting, and pagination' })
  @ApiOkResponse({ description: 'Paginated list of organizations', type: OrganizationPaginatedResponseDto })
  @ApiStandardErrors(401, 403, 500)
  async getAll(
    @Query() query: QueryOrganizationDto,
  ) {
    return this.orgService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'List organizations owned by the current user' })
  @ApiOkResponse({ description: 'Organizations owned by user', type: [OrganizationResponseDto] })
  @ApiStandardErrors(401, 403, 500)
  async getMyOrganizations(@CurrentUser() user: JwtPayload): Promise<OrganizationResponseDto[]> {
    return this.orgService.findByOwner(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details by ID' })
  @ApiParam({ name: 'id', description: 'Organization UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Organization details', type: OrganizationResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<OrganizationResponseDto> {
    return this.orgService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization details' })
  @ApiParam({ name: 'id', description: 'Organization UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Organization updated successfully', type: OrganizationResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.orgService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiParam({ name: 'id', description: 'Organization UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({
    description: 'Organization deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organization deleted successfully' },
      },
    },
  })
  @ApiStandardErrors(401, 403, 404, 500)
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgService.delete(id, user.sub);
  }
}
