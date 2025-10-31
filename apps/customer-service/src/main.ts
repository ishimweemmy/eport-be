import { NestFactory } from '@nestjs/core';
import { CoreServiceModule } from './customer-service.module';
import { setupCoreConfig } from './setup';
import { CoreServiceConfigService } from './configs/customer-service-config.service';
import { Logger } from 'nestjs-pino';
import { APP_NAME } from './common/constants/all.constants';
import { install } from 'source-map-support';
import { GrpcErrorFilter } from './common/filters/grpc-error.filter';
install();

async function bootstrap() {
  const app = await NestFactory.create(CoreServiceModule);

  // Register global GRPC error filter
  app.useGlobalFilters(new GrpcErrorFilter());

  await setupCoreConfig(app);
  await app.startAllMicroservices();

  const port = app.get(CoreServiceConfigService).port;
  const logger = app.get(Logger);

  await app.listen(port, () => {
    logger.log(`${APP_NAME} Rest is running on PORT => ${port} 🎉`);
  });
}
bootstrap();
