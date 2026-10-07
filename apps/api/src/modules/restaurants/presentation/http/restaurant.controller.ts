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
import { RestaurantService } from '../../application/services/restaurant.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
  QueryRestaurantDto,
} from './dto/restaurant.dto';

@ApiTags('Restaurants')
@Controller('restaurants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new restaurant under an organization' })
  @ApiCreatedResponse({ type: RestaurantResponseDto })
  async create(@Body() dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    return this.restaurantService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List restaurants with search, pagination, and optional organization filter' })
  @ApiOkResponse({ type: [RestaurantResponseDto] })
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
  @ApiOkResponse({ type: RestaurantResponseDto })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update restaurant details' })
  @ApiOkResponse({ type: RestaurantResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a restaurant' })
  @ApiOkResponse({ type: RestaurantResponseDto })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantService.softDelete(id);
  }
}
