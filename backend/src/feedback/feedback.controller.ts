import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ModerateFeedbackDto } from './dto/moderate-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedback: FeedbackService) {}

  @Public()
  @Get()
  listForTravel(@Query('travelId') travelId: string) {
    return this.feedback.listForTravel(travelId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateFeedbackDto) {
    return this.feedback.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  listAll() {
    return this.feedback.listAllForAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/moderate')
  moderate(@Param('id') id: string, @Body() dto: ModerateFeedbackDto) {
    return this.feedback.moderate(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedback.remove(id);
  }
}
