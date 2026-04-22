import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TravelsModule } from './travels/travels.module';
import { ReservationsModule } from './reservations/reservations.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TravelsModule,
    ReservationsModule,
    FeedbackModule,
    DashboardModule,
  ],
})
export class AppModule {}
