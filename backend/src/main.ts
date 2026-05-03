import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { resolveCorsOrigins } from './config/cors-origins.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS — set ALLOWED_ORIGINS on Render to allow Vercel + local Vite (comma-separated).
  app.enableCors({
    origin: resolveCorsOrigins({
      allowedOriginsRaw: process.env.ALLOWED_ORIGINS,
      frontendUrl: process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV,
    }),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Starlings Hospitality API')
    .setDescription('Complete travel booking platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User profile management')
    .addTag('destinations', 'Travel destinations')
    .addTag('packages', 'Travel packages')
    .addTag('cart', 'Shopping cart')
    .addTag('bookings', 'Booking management')
    .addTag('payments', 'Paystack payment integration')
    .addTag('gallery', 'Media gallery')
    .addTag('contact', 'Contact form')
    .addTag('admin', 'Admin-only endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Starlings API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
