import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser, JwtUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  // Logout is client-side (drop the token). This endpoint exists so the SPA can
  // call a single URL on sign-out for symmetry / future token-blacklist support.
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return user;
  }
}
