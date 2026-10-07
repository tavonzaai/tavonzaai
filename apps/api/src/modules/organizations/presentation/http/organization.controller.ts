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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { OrganizationService } from '../../application/services/organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  QueryOrganizationDto,
} from './dto/organization.dto';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiCreatedResponse({ type: OrganizationResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.orgService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List organizations with search, sorting, and pagination' })
  @ApiOkResponse({ description: 'Paginated list of organizations' })
  async getAll(
    @Query() query: QueryOrganizationDto,
  ) {
    return this.orgService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'List organizations owned by the current user' })
  @ApiOkResponse({ type: [OrganizationResponseDto] })
  async getMyOrganizations(@CurrentUser() user: JwtPayload): Promise<OrganizationResponseDto[]> {
    return this.orgService.findByOwner(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details by ID' })
  @ApiOkResponse({ type: OrganizationResponseDto })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<OrganizationResponseDto> {
    return this.orgService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization details' })
  @ApiOkResponse({ type: OrganizationResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.orgService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiOkResponse({ description: 'Organization deleted' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgService.delete(id, user.sub);
  }
}
