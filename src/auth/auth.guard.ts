import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(private readonly authService: AuthService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const controller = context.getClass();
    const request = context.switchToHttp().getRequest();

    if (controller.name === 'AuthController') {
      return true;
    }
    return this.validateRequest(request);
  }

  private async validateRequest(request: any): Promise<any> {
    const bearerToken = request.headers.authorization;
    if (!bearerToken) {
      throw new UnauthorizedException('No token provided');
    }

    if (!bearerToken.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }

    const token = bearerToken.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = this.authService.validateClientSession(token);
    return true;
  }
}
