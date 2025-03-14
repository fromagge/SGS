import {
  Controller,
  Get,
  Logger,
  Post,
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
    this.logger.log('User requesting data', req.user);
    return {
      "email": "test@test.com",
      "name": "test",
      "picture": "https://picsum.photos/200/300"
    }
    try {
      return await this.userService.getUserSummary(req.user.token);
    } catch (error) {
      this.logger.error('Error getting user summary', error);
      throw new UnauthorizedException('Error getting user summary');
    }
  }

}
