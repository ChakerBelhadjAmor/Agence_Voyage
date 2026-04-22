import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`API ready on http://localhost:${port}/api`);
}

bootstrap();
