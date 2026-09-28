// ============================================================================
// @CurrentUser() — Parameter decorator to get the JWT payload in controllers
//
// Usage:
//   async myEndpoint(@CurrentUser() user: JwtPayload) {
//     console.log(user.sub); // userId
//   }
// ============================================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../../modules/identity/infrastructure/adapters/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
