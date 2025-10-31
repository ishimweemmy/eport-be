import { Module } from '@nestjs/common';
import { EmailNotifierService } from './email-notifier.service';
import { EmailNotifierController } from './email-notifier.controller';
import { SlackModule } from '../slack/slack.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationConfigService } from '@notification-service/configs/notification-config.service';
@Module({
  imports: [SlackModule, MailerModule],
  controllers: [EmailNotifierController],
  providers: [EmailNotifierService, NotificationConfigService],
  exports: [EmailNotifierService],
})
export class EmailNotifierModule {}
