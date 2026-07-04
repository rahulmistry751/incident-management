import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from '@fastify/helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV === 'test' ? false : { level: 'info' },
    })
  );

  // Secure app with Helmet HTTP Headers
  await app.register(helmet);

  // Set up validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Swagger integration
  const config = new DocumentBuilder()
    .setTitle('Incident Management System API')
    .setDescription('NestJS + Fastify backend for Incident Management and AI Root Cause analysis.')
    .setVersion('1.0.0')
    .addTag('Incidents')
    .addTag('AI Analysis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const HOST = '0.0.0.0';

  await app.listen(PORT, HOST);
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/documentation`);
}
bootstrap();
