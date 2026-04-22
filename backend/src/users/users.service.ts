import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const data: any = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    };
    if (dto.newPassword) {
      data.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const user = await this.prisma.user.update({ where: { id }, data });
    return this.sanitize(user);
  }

  private sanitize(user: any) {
    const { password, resetTokenHash, resetTokenExpiresAt, ...safe } = user;
    return safe;
  }
}
