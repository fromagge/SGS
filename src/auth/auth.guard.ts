import { Injectable, CanActivate, Logger, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "auth/auth.service";


@Injectable()
export class AuthGuard implements CanActivate {

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
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return false;
    }
    if (!authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return false;
    }

    const claims = await this.authService.verifyJwtToken(token, true);
    if (!claims) {
      return false;
    }

    console.log('token', token);

    request.user = claims;
    request.user.token = token;
    return false;
  }
}
