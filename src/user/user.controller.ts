import {
  Controller,
  Get,
  Logger,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('self')
  async self(@Req() req: any) {
    try {
      return await this.userService.getUserSummary(req.user);
    } catch (error) {
      this.logger.error('Error getting user summary', error);
      throw new UnauthorizedException('Session not found');
    }
  }
}
