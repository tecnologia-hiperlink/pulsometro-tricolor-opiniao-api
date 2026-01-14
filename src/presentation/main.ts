import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN || true });

  // Configurar serve static para servir arquivos da pasta assets
  app.useStaticAssets(join(process.cwd(), 'assets'), {
    prefix: '/assets/',
  });

  const config = new DocumentBuilder().setTitle('Node API').setVersion('1.0').build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Application listening on port http://localhost:${port}`);
}

bootstrap();
