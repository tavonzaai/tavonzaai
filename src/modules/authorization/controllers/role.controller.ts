// ============================================================================
// Role & Permission Management Controller
// ============================================================================

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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permission } from '@/authorization';
import { RoleService } from '../services/role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignUserRoleDto,
  RoleResponseDto,
  RoleDetailResponseDto,
} from '../dto/role.dto';
import { ApiStandardErrors } from '../../../common/swagger';

@ApiTags('Authorization | Roles & Permissions')
@Controller('authorization')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
@ApiStandardErrors(400, 401, 403, 500)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // ── Current Authenticated User Role & Capabilities ─────────────────────────

  @Get('me')
  @ApiOperation({
    summary: 'Get assigned dynamic role and effective permissions for current authenticated user',
    description: 'Resolves caller’s single assigned dynamic role from user_roles and effective permission array directly from the database.',
  })
  async getMyRole(@CurrentUser() user: any) {
    const role = await this.roleService.getUserRole(user.sub);
    const live = await this.roleService.getEffectivePermissions(user.sub);
    return {
      userId: user.sub,
      email: user.email,
      globalRole: user.role,
      role,
      permissions: live.permissions,
      scopes: live.scopes,
    };
  }

  // ── Permissions Catalog ───────────────────────────────────────────────────

  @Get('permissions')
  @RequirePermissions(Permission.PERMISSIONS_READ)
  @ApiOperation({
    summary: 'List all available system permissions',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [permissions:read]. Returns catalog of all declared module permissions grouped by module_name.',
  })
  async getAllPermissions() {
    return this.roleService.getAllPermissions();
  }

  @Get('permission-templates')
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Staff permission templates including Assistant Manager',
    description:
      'Starting templates for staff assignments. Assistant Manager is BRANCH_MANAGER with a reduced permissions[] set.',
  })
  async getPermissionTemplates() {
    return this.roleService.getPermissionTemplates();
  }

  // ── Roles Management ──────────────────────────────────────────────────────

  @Get('roles')
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'List all roles with assignment and permission metrics',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [roles:read]. Returns all system and custom roles with user count and permission count. Supports optional search filtering.',
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Optional search text to filter by role name or slug', example: 'waiter' })
  @ApiOkResponse({ type: [RoleResponseDto] })
  async getAllRoles(@Query('search') search?: string): Promise<RoleResponseDto[]> {
    return this.roleService.getAllRoles(search);
  }

  @Get('roles/:id')
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Get role details with matrix representation',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [roles:read]. Returns role info, normalized permission keys, and checkbox matrix { module: { read, write, update, delete } }.',
  })
  @ApiParam({ name: 'id', description: 'Role UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @ApiOkResponse({ type: RoleDetailResponseDto })
  async getRoleById(@Param('id', new ParseUUIDPipe()) id: string): Promise<RoleDetailResponseDto> {
    return this.roleService.getRoleDetailWithMatrix(id);
  }

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.ROLES_WRITE)
  @ApiOperation({
    summary: 'Create a new role with assigned permissions',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [roles:write]. Creates role and associates permissions via list or matrix.',
  })
  @ApiCreatedResponse({ type: RoleDetailResponseDto })
  async createRole(@Body() dto: CreateRoleDto): Promise<RoleDetailResponseDto> {
    return this.roleService.createRole(dto);
  }

  @Patch('roles/:id')
  @RequirePermissions(Permission.ROLES_UPDATE)
  @ApiOperation({
    summary: 'Update role details and permission matrix',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [roles:update]. Updates name, description, and permission associations. System role slugs are protected.',
  })
  @ApiParam({ name: 'id', description: 'Role UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @ApiOkResponse({ type: RoleDetailResponseDto })
  async updateRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleDetailResponseDto> {
    return this.roleService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @RequirePermissions(Permission.ROLES_DELETE)
  @ApiOperation({
    summary: 'Delete a custom role',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [roles:delete]. Deletion is blocked if the role is a system role or has users currently assigned.',
  })
  @ApiParam({ name: 'id', description: 'Role UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  async deleteRole(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roleService.deleteRole(id);
  }

  // ── User Role Assignment (Single Role per User) ───────────────────────────

  @Get('users/:userId/role')
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Get assigned role and permissions for a user',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [roles:read]. Resolves user single assigned role from user_roles and effective permissions.',
  })
  @ApiParam({ name: 'userId', description: 'User UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  async getUserRole(@Param('userId', new ParseUUIDPipe()) userId: string) {
    const role = await this.roleService.getUserRole(userId);
    const permissions = await this.roleService.getUserPermissions(userId);
    return {
      userId,
      role,
      permissions,
    };
  }

  @Post('users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.USERS_ASSIGN_ROLE)
  @ApiOperation({
    summary: 'Assign or reassign role to a user (enforces exactly 1 role per user)',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [users:assign_role]. Database unique constraint ensures the user has at most one role.',
  })
  @ApiParam({ name: 'userId', description: 'User UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  async assignUserRole(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: AssignUserRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.roleService.assignUserRole(userId, dto.roleId, user?.sub);
  }

  @Delete('users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.USERS_ASSIGN_ROLE)
  @ApiOperation({
    summary: 'Revoke assigned role from a user',
    description: 'Route Guard: Protected by JwtAuthGuard + PermissionsGuard requiring [users:assign_role]. Removes assignment from user_roles.',
  })
  @ApiParam({ name: 'userId', description: 'User UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  async removeUserRole(@Param('userId', new ParseUUIDPipe()) userId: string) {
    await this.roleService.removeUserRole(userId);
    return { success: true, message: 'Role revoked from user' };
  }
}
