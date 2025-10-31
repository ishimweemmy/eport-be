import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppEnvironment } from '@crons-service/configs/dto/env-variables.dto';
import {
  APP_BASE_PATH,
  APP_NAME,
  SWAGGER_DOCUMENTATION_PATH,
} from '@crons-service/common/constants/all.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { CronsConfigService } from '@crons-service/configs/crons-config.service';

export const setupCronsConfig = async (app: INestApplication) => {
  const isProdMode =
    app.get(CronsConfigService).environment === AppEnvironment.Production;
  enableValidationPipe(app);

  app.setGlobalPrefix(APP_BASE_PATH);

  app.useLogger(app.get(Logger));

  if (!isProdMode) enableOpenApiDocumentation(app);

  app.use(cookieParser());
  enableSecurity(app);
  app.enableCors({
    origin: isProdMode
      ? ['https://app.eport.rp.ac.rw', 'https://eport.rp.ac.rw']
      : '*',
    methods: '*',
  });

  app.enableShutdownHooks();
};

/**
 * Security configurations like Helmet.
 */
const enableSecurity = (app: INestApplication) => {
  app.use(
    helmet({
      hidePoweredBy: true,
      xssFilter: true,
    }),
  );
};

const enableValidationPipe = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

const enableOpenApiDocumentation = (app: INestApplication) => {
  const isProduction =
    app.get(CronsConfigService).environment === AppEnvironment.Production;

  if (isProduction) return;

  const config = new DocumentBuilder()
    .setTitle(`${APP_NAME.split('-').join(' ')}`)
    .setDescription('The Crons Service API Documentation. 🚀🚀🚀')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_DOCUMENTATION_PATH, app, document, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
  });
};
