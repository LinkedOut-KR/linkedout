import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT ?? 4002);
  console.log(`Experience Service running on http://localhost:${process.env.PORT ?? 4002}`);
}
bootstrap();
