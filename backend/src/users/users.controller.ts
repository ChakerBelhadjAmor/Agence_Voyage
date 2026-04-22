import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.users.findById(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }
}
