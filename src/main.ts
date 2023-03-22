import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter, PrismaService } from 'nestjs-prisma';
import { AppModule } from './app.module';
import { NestConfig, SwaggerConfig } from './common/config/config.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Validation
  app.useGlobalPipes(new ValidationPipe());

  //Prisma error binding filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  //Prisma shutdown hook
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  //Swagger settings
  if (swaggerConfig.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Nestjs Toy Project')
      .setDescription(
        swaggerConfig.description || 'The Toy Project API description',
      )
      .setVersion(swaggerConfig.version || '1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document);
  }

  await app.listen(process.env.PORT || nestConfig.port || 3000);
}
bootstrap();
