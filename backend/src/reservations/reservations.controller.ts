import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { DecisionDto } from './dto/decision.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private reservations: ReservationsService) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateReservationDto) {
    return this.reservations.create(user.id, dto);
  }

  @Get('me')
  mine(@CurrentUser() user: JwtUser) {
    return this.reservations.listMine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  all() {
    return this.reservations.listAll();
  }

  @Delete(':id')
  cancel(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.reservations.cancel(user.id, user.role as Role, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/decision')
  decide(@Param('id') id: string, @Body() dto: DecisionDto) {
    return this.reservations.decide(id, dto);
  }
}
