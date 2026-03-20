import { Logger, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set Logger
  const logger = new Logger('Bootstrap');

  app.enableCors();

  // Set prefix
  app.setGlobalPrefix('api');

  // Set Global Filters
  app.useGlobalFilters(new AllExceptionsFilter(new Logger('ExceptionFilter')));

  // Set Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set Swagger
  const config = new DocumentBuilder()
    .setTitle('Error Monitoring Platform')
    .setDescription(
      'Error monitoring platform with SDK ingestion + team visibility',
    )
    .setVersion('0.0.1')
    // .addTag(' Errors')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Set Global Interceptors
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // App listener
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`App runing on port ${process.env.PORT}`);
}
bootstrap();
