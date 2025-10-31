import { NestFactory } from '@nestjs/core';
import { AdminServiceModule } from '@admin-service/admin-service.module';
import { setupAdminConfig } from '@admin-service/setup';
import { AdminConfigService } from '@admin-service/configs/admin-config.service';
import { Logger } from 'nestjs-pino';
import { APP_NAME } from '@admin-service/common/constants/all.constants';
import { install } from 'source-map-support';
install();

async function bootstrap() {
  const app = await NestFactory.create(AdminServiceModule);

  await setupAdminConfig(app);

  const port = app.get(AdminConfigService).port;
  const logger = app.get(Logger);

  await app.listen(port, () => {
    logger.log(`${APP_NAME} is running on PORT => ${port} 🎉`);
  });
}
bootstrap();
