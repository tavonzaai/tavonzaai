import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid service token');
    }
    const token = authHeader.split(' ')[1];
    const expectedToken =
      process.env.INTERNAL_API_SERVICE_TOKEN ||
      'sec_prod_tavonza_internal_service_token_987654321';

    if (!expectedToken || token !== expectedToken) {
      throw new UnauthorizedException('Unauthorized internal service call');
    }
    return true;
  }
}
