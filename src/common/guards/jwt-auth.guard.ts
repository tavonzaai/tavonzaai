// ============================================================================
// JwtAuthGuard — apply to any route that requires authentication
//
// Usage:
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token')
// ============================================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
