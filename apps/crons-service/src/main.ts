import { NestFactory } from '@nestjs/core';
import { CronsModule } from '@crons-service/crons-service';
import { CronsConfigService } from '@crons-service/configs/crons-config.service';
import { Logger } from 'nestjs-pino';
import { APP_NAME } from '@crons-service/common/constants/all.constants';
import { setupCronsConfig } from '@crons-service/setup';

async function bootstrap() {
  const app = await NestFactory.create(CronsModule);
  setupCronsConfig(app);

  const port = app.get(CronsConfigService).port;
  const logger = app.get(Logger);
  await app.listen(port, () => {
    logger.log(`${APP_NAME} Rest is running on PORT => ${port} 🎉`);
  });
}
bootstrap();
