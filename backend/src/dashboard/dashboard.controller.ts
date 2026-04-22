import { Controller, Get, Header, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('kpis')
  kpis() {
    return this.dashboard.kpis();
  }

  @Get('export/reservations.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="reservations.csv"')
  async csv() {
    return this.dashboard.exportReservationsCsv();
  }

  @Get('export/reservations.xlsx')
  async xlsx(@Res() res: Response) {
    const buf = await this.dashboard.exportReservationsXlsx();
    res
      .setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      .setHeader('Content-Disposition', 'attachment; filename="reservations.xlsx"')
      .send(buf);
  }
}
