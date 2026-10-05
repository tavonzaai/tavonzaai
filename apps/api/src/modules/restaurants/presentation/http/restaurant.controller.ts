import {
  Controller,
  Get,
  Post,
  Patch,
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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RestaurantService } from '../../application/services/restaurant.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
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
  @ApiOperation({ summary: 'List restaurants by organization ID' })
  @ApiQuery({ name: 'organizationId', required: true, type: String })
  @ApiOkResponse({ type: [RestaurantResponseDto] })
  async listByOrg(
    @Query('organizationId', new ParseUUIDPipe()) organizationId: string,
  ): Promise<RestaurantResponseDto[]> {
    return this.restaurantService.findByOrganizationId(organizationId);
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
}
