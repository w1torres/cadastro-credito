import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    // Aceita uma lista separada por vírgula (ex.: "http://localhost:5173,http://127.0.0.1:5173")
    // porque alguns navegadores/redes tratam "localhost" e "127.0.0.1" como origens distintas.
    origin: corsOrigin?.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
