import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReservationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { DecisionDto } from './dto/decision.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReservationDto) {
    return this.prisma.$transaction(async (tx) => {
      const travel = await tx.travel.findUnique({ where: { id: dto.travelId } });
      if (!travel || !travel.active) throw new NotFoundException('Travel not available');

      const booked = await tx.reservation.aggregate({
        where: {
          travelId: travel.id,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        },
        _sum: { seats: true },
      });
      const used = booked._sum.seats ?? 0;
      if (used + dto.seats > travel.capacity) {
        throw new BadRequestException('Not enough seats remaining');
      }

      const totalPrice = new Prisma.Decimal(travel.price).mul(dto.seats);

      return tx.reservation.create({
        data: {
          userId,
          travelId: travel.id,
          seats: dto.seats,
          totalPrice,
          status: ReservationStatus.PENDING,
        },
        include: { travel: true },
      });
    });
  }

  listMine(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { travel: true, feedback: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAll() {
    return this.prisma.reservation.findMany({
      include: {
        travel: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(userId: string, role: Role, id: string) {
    const r = await this.prisma.reservation.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Reservation not found');
    if (role !== Role.ADMIN && r.userId !== userId) throw new ForbiddenException();
    if (r.status === ReservationStatus.CANCELLED) return r;
    if (r.status === ReservationStatus.REJECTED) {
      throw new BadRequestException('Reservation already rejected');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
    });
  }

  async decide(id: string, dto: DecisionDto) {
    const r = await this.prisma.reservation.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Reservation not found');
    if (r.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be decided');
    }
    return this.prisma.reservation.update({
      where: { id },
      data: { status: dto.decision as ReservationStatus },
      include: { travel: true, user: { select: { id: true, email: true } } },
    });
  }
}
