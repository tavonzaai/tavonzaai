// ============================================================================
// User Controller — User Profile & User Management REST Endpoints
// ============================================================================

import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../infrastructure/adapters/jwt.strategy';
import { UserService } from '../../application/services/user.service';
import {
  UpdateUserProfileDto,
  GetUsersFilterDto,
  UpdateUserStatusDto,
  CreateCustomerUserDto,
  CreateAdminUserDto,
} from './dto/user-request.dto';
import {
  UserDetailResponseDto,
  UsersListResponseDto,
} from './dto/user-response.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Identity | User Management')
@ApiStandardErrors(400, 401, 403, 500)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * PATCH /users/me
   * Update the current authenticated user's profile.
   * Supports both application/json and multipart/form-data with file avatar upload.
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Update own user profile',
    description:
      'Update name, contact number, avatar URL or file upload, and FCM token for currently logged in user.',
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    type: UpdateUserProfileDto,
    description: 'Profile update fields or multipart form data',
  })
  @ApiOkResponse({ type: UserDetailResponseDto })
  @ApiConflictResponse({ description: 'Contact number already in use' })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<UserDetailResponseDto> {
    let dto: UpdateUserProfileDto = { ...body };

    // Support multipart form-data where frontend sends 'data' as JSON string
    if (body && typeof body.data === 'string') {
      try {
        const parsed = JSON.parse(body.data);
        dto = { ...dto, ...parsed };
      } catch {
        // Fallback to direct fields
      }
    }

    return this.userService.updateMe(user.sub, dto, avatarFile);
  }

  /**
   * GET /users/me
   * Get the current authenticated user's profile.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ type: UserDetailResponseDto })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserDetailResponseDto> {
    return this.userService.getMe(user.sub);
  }

  /**
   * GET /users
   * Retrieve all users with filters, search, and pagination.
   * Requires admin role or staff reading capabilities.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all users with search, filtering, and pagination',
    description:
      'Search across name, email, contactNo with filters for role and status. Returns paginated list.',
  })
  @ApiOkResponse({ type: UsersListResponseDto })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async getUsers(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetUsersFilterDto,
  ): Promise<UsersListResponseDto> {
    return this.userService.getUsers(query, user);
  }

  /**
   * GET /users/:id
   * Get a single user by ID.
   * Users can view their own profile; admins/staff can view any profile.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID', example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  @ApiOkResponse({ type: UserDetailResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async getUserById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<UserDetailResponseDto> {
    return this.userService.getUserById(id, user);
  }

  /**
   * PATCH /users/status/:id
   * Toggle or update user status (ACTIVE, INACTIVE, BANNED, DELETED).
   * Restricted to administrators.
   */
  @Patch('status/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Toggle or update user status' })
  @ApiParam({ name: 'id', description: 'User UUID', example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  @ApiOkResponse({ type: UserDetailResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Administrator privileges required' })
  async changeStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body?: UpdateUserStatusDto,
  ): Promise<UserDetailResponseDto> {
    return this.userService.changeStatus(id, body?.status, user);
  }

  /**
   * DELETE /users/:id
   * Soft delete a user by setting status to DELETED.
   * Restricted to administrators.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Soft delete a user account' })
  @ApiParam({ name: 'id', description: 'User UUID', example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  @ApiOkResponse({ type: UserDetailResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Administrator privileges required' })
  async softDelete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<UserDetailResponseDto> {
    return this.userService.softDelete(id, user);
  }

  /**
   * POST /users/create-customer
   * Public or admin endpoint to create a customer account.
   */
  @Post('create-customer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a customer user account' })
  @ApiCreatedResponse({ type: UserDetailResponseDto })
  @ApiConflictResponse({ description: 'Email or phone already in use' })
  @ApiBadRequestResponse({ description: 'Invalid input or weak password' })
  async createCustomer(
    @Body() dto: CreateCustomerUserDto,
  ): Promise<UserDetailResponseDto> {
    return this.userService.createCustomer(dto);
  }

  /**
   * POST /users/create-admin
   * Create an administrator account (SUPER_ADMIN only).
   */
  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create an administrator account (SUPER_ADMIN only)' })
  @ApiCreatedResponse({ type: UserDetailResponseDto })
  @ApiConflictResponse({ description: 'Email or phone already in use' })
  @ApiForbiddenResponse({ description: 'SUPER_ADMIN privilege required' })
  async createAdmin(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAdminUserDto,
  ): Promise<UserDetailResponseDto> {
    return this.userService.createAdmin(dto, user);
  }
}
