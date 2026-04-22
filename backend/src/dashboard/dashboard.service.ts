import { Injectable } from '@nestjs/common';
import { ReservationStatus, Role } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async kpis() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [users, clients, travels, activeTravels, reservations, confirmed, pending, revenueAgg, recent] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.CLIENT } }),
        this.prisma.travel.count(),
        this.prisma.travel.count({ where: { active: true } }),
        this.prisma.reservation.count(),
        this.prisma.reservation.count({ where: { status: ReservationStatus.CONFIRMED } }),
        this.prisma.reservation.count({ where: { status: ReservationStatus.PENDING } }),
        this.prisma.reservation.aggregate({
          where: { status: ReservationStatus.CONFIRMED },
          _sum: { totalPrice: true },
        }),
        this.prisma.reservation.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true, totalPrice: true, status: true },
        }),
      ]);

    const dailyMap = new Map<string, { bookings: number; revenue: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { bookings: 0, revenue: 0 });
    }
    for (const r of recent) {
      const key = r.createdAt.toISOString().slice(0, 10);
      const cur = dailyMap.get(key);
      if (!cur) continue;
      cur.bookings += 1;
      if (r.status === ReservationStatus.CONFIRMED) {
        cur.revenue += Number(r.totalPrice);
      }
    }
    const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

    const topDestinations = await this.prisma.travel.findMany({
      take: 5,
      orderBy: { reservations: { _count: 'desc' } },
      select: {
        id: true,
        title: true,
        destination: true,
        _count: { select: { reservations: true } },
      },
    });

    return {
      users,
      clients,
      admins: users - clients,
      travels,
      activeTravels,
      reservations: { total: reservations, confirmed, pending },
      revenue: Number(revenueAgg._sum.totalPrice ?? 0),
      daily,
      topDestinations: topDestinations.map((t) => ({
        id: t.id,
        title: t.title,
        destination: t.destination,
        bookings: t._count.reservations,
      })),
    };
  }

  async exportReservationsCsv(): Promise<string> {
    const rows = await this.prisma.reservation.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        travel: { select: { title: true, destination: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = [
      'id',
      'createdAt',
      'status',
      'seats',
      'totalPrice',
      'clientEmail',
      'clientName',
      'travel',
      'destination',
    ];
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push(
        [
          r.id,
          r.createdAt.toISOString(),
          r.status,
          r.seats,
          r.totalPrice.toString(),
          r.user.email,
          `${r.user.firstName} ${r.user.lastName}`,
          r.travel.title,
          r.travel.destination,
        ]
          .map(escape)
          .join(','),
      );
    }
    return lines.join('\n');
  }

  async exportReservationsXlsx(): Promise<Buffer> {
    const rows = await this.prisma.reservation.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        travel: { select: { title: true, destination: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Reservations');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 26 },
      { header: 'Created', key: 'createdAt', width: 22 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Seats', key: 'seats', width: 8 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Client email', key: 'email', width: 28 },
      { header: 'Client name', key: 'name', width: 24 },
      { header: 'Travel', key: 'travel', width: 28 },
      { header: 'Destination', key: 'destination', width: 24 },
    ];
    for (const r of rows) {
      sheet.addRow({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        status: r.status,
        seats: r.seats,
        total: Number(r.totalPrice),
        email: r.user.email,
        name: `${r.user.firstName} ${r.user.lastName}`,
        travel: r.travel.title,
        destination: r.travel.destination,
      });
    }
    sheet.getRow(1).font = { bold: true };
    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}
