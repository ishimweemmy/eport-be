import {
  NOTIFICATION_QUEUE_NAMES,
  QUEUE_HANDLERS,
} from '@app/common/constants/rabbitmq-constants';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from '@crons-service/integrations/notification/notification.service';
import { NotificationPreProcessor } from '@crons-service/integrations/notification/notification.preprocessor';
import { CronsConfigService } from '@crons-service/configs/crons-config.service';
import { createQueueProvider } from '@app/common/rabbitmq/queue.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: QUEUE_HANDLERS.EMAIL,
      useFactory: (configService: CronsConfigService) =>
        createQueueProvider(
          NOTIFICATION_QUEUE_NAMES.EMAIL,
          configService.rabbitmqUri,
        ),
      inject: [CronsConfigService],
    },
    NotificationService,
    NotificationPreProcessor,
  ],
  exports: [
    QUEUE_HANDLERS.EMAIL,
    NotificationService,
    NotificationPreProcessor,
  ],
})
export class NotificationModule {}
