import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationGrpcService } from './notification-grpc.service';
import {
  SendEmailGrpcRequest,
  SendEmailGrpcResponse,
  SendAdminAlertGrpcRequest,
} from './dto/send-email-grpc.dto';
import {
  GrpcServices,
  NotificationGrpcMethods,
} from '../../common/constants/grpc.constants';

@Controller()
export class NotificationGrpcController {
  constructor(
    private readonly notificationGrpcService: NotificationGrpcService,
  ) {}

  @GrpcMethod(
    GrpcServices.NOTIFICATION_SERVICE,
    NotificationGrpcMethods.SEND_EMAIL,
  )
  async sendEmail(data: SendEmailGrpcRequest): Promise<SendEmailGrpcResponse> {
    return this.notificationGrpcService.sendEmail(data);
  }

  @GrpcMethod(
    GrpcServices.NOTIFICATION_SERVICE,
    NotificationGrpcMethods.SEND_ADMIN_ALERT,
  )
  async sendAdminAlert(
    data: SendAdminAlertGrpcRequest,
  ): Promise<SendEmailGrpcResponse> {
    return this.notificationGrpcService.sendAdminAlert(data);
  }
}
