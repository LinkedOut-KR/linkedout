import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const authService = process.env.AUTH_SERVICE_URL ?? 'http://localhost:4001';
    const expService = process.env.EXPERIENCE_SERVICE_URL ?? 'http://localhost:4002';

    consumer
      .apply(createProxyMiddleware({ target: authService, changeOrigin: true }))
      .forRoutes('api/auth', 'api/users');

    consumer
      .apply(createProxyMiddleware({ target: expService, changeOrigin: true }))
      .forRoutes('api/experiences');
  }
}
