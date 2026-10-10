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
import { RestaurantService } from '../../application/services/restaurant.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
  QueryRestaurantDto,
} from './dto/restaurant.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

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
  async create(@Body() dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    return this.restaurantService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List restaurants with search, pagination, and optional organization filter' })
  @ApiOkResponse({ description: 'List of restaurants or paginated restaurant collection', type: [RestaurantResponseDto] })
  @ApiStandardErrors(401, 403, 500)
  async listByOrg(
    @Query() query: QueryRestaurantDto,
  ): Promise<any> {
    if (query.page !== undefined || query.search !== undefined) {
      return this.restaurantService.findAll(query);
    }
    if (query.organizationId) {
      return this.restaurantService.findByOrganizationId(query.organizationId, query.includeDeleted);
    }
    return this.restaurantService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant details by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Restaurant details', type: RestaurantResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update restaurant details' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Restaurant updated successfully', type: RestaurantResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ description: 'Restaurant soft-deleted', type: RestaurantResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.softDelete(id);
  }
}
