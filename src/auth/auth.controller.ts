import { Controller, Post, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards() 
  login() {
    return 'Login endpoint';
  }

  @Post('register')
  register() {
    return 'Register endpoint';
  }
} 