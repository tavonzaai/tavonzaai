// ============================================================================
// Me Controller — Root /me routes for profile and staff assignments
// ============================================================================

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../infrastructure/adapters/jwt.strategy';
import { UserService } from '../../application/services/user.service';
import { AuthService } from '../../application/services/auth.service';
import {
  MyAssignmentsResponseDto,
} from './dto/user-response.dto';
import { UserProfileDto } from './dto/auth-response.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Identity | User Management')
@ApiStandardErrors(400, 401, 500)
@Controller('me')
export class MeController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * GET /me
   * Return authenticated user profile (alias for /auth/me)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserProfileDto> {
    return this.authService.getMe(user.sub);
  }

  /**
   * GET /me/assignments
   * Return staff assignments for authenticated user
   */
  @Get('assignments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get staff assignments for current authenticated user' })
  @ApiOkResponse({ type: MyAssignmentsResponseDto })
  async getAssignments(
    @CurrentUser() user: JwtPayload,
  ): Promise<MyAssignmentsResponseDto> {
    return this.userService.getMyAssignments(user.sub);
  }
}
