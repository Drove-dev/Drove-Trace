import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set Logger
  const logger = new Logger('Bootstrap');
  
  // Set prefix
  app.setGlobalPrefix('api');

  // Set Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Set Swagger
   const config = new DocumentBuilder()
    .setTitle('Error Monitoring Platform')
    .setDescription('Error monitoring platform with SDK ingestion + team visibility')
    .setVersion('1.0')
    // .addTag(' Errors')
    .build();
    
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // App listener
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`App runing on port ${process.env.PORT}`);
  
}
bootstrap();
