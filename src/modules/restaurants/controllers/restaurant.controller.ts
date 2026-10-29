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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { RestaurantService } from '../services/restaurant.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
  QueryRestaurantDto,
  CheckSlugResponseDto,
} from '../dto/restaurant.dto';
import { ApiStandardErrors } from '../../../common/swagger';

@ApiTags('Core | Restaurant Management')
@Controller('restaurants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new restaurant under an organization' })
  @ApiCreatedResponse({ description: 'Restaurant created successfully', type: RestaurantResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List restaurants with search, pagination, and optional organization filter' })
  @ApiOkResponse({ description: 'List of restaurants or paginated restaurant collection', type: [RestaurantResponseDto] })
  @ApiStandardErrors(401, 403, 500)
  async listByOrg(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryRestaurantDto,
  ): Promise<any> {
    if (query.page !== undefined || query.search !== undefined) {
      return this.restaurantService.findAll(user, query);
    }
    if (query.organizationId) {
      return this.restaurantService.findByOrganizationId(user, query.organizationId, query.includeDeleted);
    }
    return this.restaurantService.findAll(user, query);
  }

  @Get('check-slug')
  @ApiOperation({ summary: 'Check live slug availability' })
  @ApiQuery({ name: 'slug', description: 'Restaurant slug to verify', example: 'tasty-bites' })
  @ApiOkResponse({ description: 'Slug availability status and alternative suggestion if taken', type: CheckSlugResponseDto })
  @ApiStandardErrors(400, 401, 500)
  async checkSlug(
    @Query('slug') slug: string,
  ): Promise<CheckSlugResponseDto> {
    if (!slug || !slug.trim()) {
      throw new BadRequestException('Query parameter "slug" is required');
    }
    return this.restaurantService.checkSlugAvailability(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant details by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Restaurant details', type: RestaurantResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getById(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.findById(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update restaurant details' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Restaurant updated successfully', type: RestaurantResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Restaurant soft-deleted', type: RestaurantResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.softDelete(user, id);
  }
}
