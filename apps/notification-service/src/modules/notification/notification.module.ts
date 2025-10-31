import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGrpcController } from './notification-grpc.controller';
import { NotificationGrpcService } from './notification-grpc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { SlackModule } from '../slack/slack.module';
import { EmailNotifierModule } from '../email-notifier/email-notifier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    SlackModule,
    EmailNotifierModule,
  ],
  controllers: [NotificationController, NotificationGrpcController],
  providers: [NotificationService, NotificationGrpcService],
  exports: [NotificationService, NotificationGrpcService],
})
export class NotificationModule {}
