import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { FilterTravelsDto } from './dto/filter-travels.dto';

@Injectable()
export class TravelsService {
  constructor(private prisma: PrismaService) {}

  async list(filter: FilterTravelsDto) {
    const where: Prisma.TravelWhereInput = {};
    if (!filter.includeInactive) where.active = true;
    if (filter.destination) where.destination = { contains: filter.destination, mode: 'insensitive' };
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { destination: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.minPrice != null || filter.maxPrice != null) {
      where.price = {};
      if (filter.minPrice != null) (where.price as any).gte = filter.minPrice;
      if (filter.maxPrice != null) (where.price as any).lte = filter.maxPrice;
    }
    if (filter.startAfter) where.startDate = { gte: new Date(filter.startAfter) };
    if (filter.endBefore) where.endDate = { lte: new Date(filter.endBefore) };

    const page = filter.page || 1;
    const pageSize = filter.pageSize || 12;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.travel.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.travel.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const travel = await this.prisma.travel.findUnique({
      where: { id },
      include: {
        feedbacks: {
          where: { status: 'APPROVED' },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!travel) throw new NotFoundException('Travel not found');
    return travel;
  }

  async create(dto: CreateTravelDto) {
    this.validateDates(dto.startDate, dto.endDate);
    return this.prisma.travel.create({ data: dto });
  }

  async update(id: string, dto: UpdateTravelDto) {
    if (dto.startDate || dto.endDate) {
      const existing = await this.prisma.travel.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Travel not found');
      this.validateDates(dto.startDate ?? existing.startDate.toISOString(), dto.endDate ?? existing.endDate.toISOString());
    }
    try {
      return await this.prisma.travel.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Travel not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.travel.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new NotFoundException('Travel not found');
    }
  }

  async duplicate(id: string) {
    const t = await this.prisma.travel.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Travel not found');
    const { id: _id, createdAt, updatedAt, ...rest } = t;
    return this.prisma.travel.create({
      data: { ...rest, title: `${rest.title} (copy)`, active: false },
    });
  }

  private validateDates(start: string | Date, end: string | Date) {
    const s = new Date(start);
    const e = new Date(end);
    if (e <= s) throw new BadRequestException('endDate must be after startDate');
  }
}
