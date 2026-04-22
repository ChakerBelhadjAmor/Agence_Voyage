import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackStatus, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ModerateFeedbackDto } from './dto/moderate-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: { travel: true, feedback: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.userId !== userId) throw new ForbiddenException();
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed reservations can be reviewed');
    }
    if (reservation.travel.endDate > new Date()) {
      throw new BadRequestException('Trip has not ended yet');
    }
    if (reservation.feedback) throw new ConflictException('Feedback already submitted');

    return this.prisma.feedback.create({
      data: {
        userId,
        travelId: reservation.travelId,
        reservationId: reservation.id,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  listForTravel(travelId: string) {
    return this.prisma.feedback.findMany({
      where: { travelId, status: FeedbackStatus.APPROVED },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAllForAdmin() {
    return this.prisma.feedback.findMany({
      include: {
        travel: { select: { id: true, title: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async moderate(id: string, dto: ModerateFeedbackDto) {
    const fb = await this.prisma.feedback.findUnique({ where: { id } });
    if (!fb) throw new NotFoundException('Feedback not found');
    return this.prisma.feedback.update({
      where: { id },
      data: { status: dto.decision as FeedbackStatus },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.feedback.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new NotFoundException('Feedback not found');
    }
  }
}
