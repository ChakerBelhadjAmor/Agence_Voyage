import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password, role: Role.CLIENT },
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Always respond OK to avoid leaking which emails are registered.
    if (!user) return { ok: true };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExpiresAt: expires },
    });

    const url = `${this.config.get('FRONTEND_URL')}/reset-password?token=${rawToken}`;
    // In production, send an email. For dev, we log it so the developer can test.
    this.logger.log(`Password reset link for ${user.email}: ${url}`);

    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    const password = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password, resetTokenHash: null, resetTokenExpiresAt: null },
    });

    return { ok: true };
  }

  private issueToken(user: { id: string; email: string; role: Role; firstName: string; lastName: string }) {
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
