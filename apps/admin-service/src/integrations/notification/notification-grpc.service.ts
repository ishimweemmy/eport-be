import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { NOTIFICATION_GRPC_PACKAGE } from '@admin-service/integrations/notification/notification-grpc.module';
import { lastValueFrom, Observable } from 'rxjs';

interface SendEmailRequest {
  template_name: string;
  recipients: string[];
  template_data: Record<string, string>;
  triggered_by: string;
  reference_id: string;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
  notification_id: string;
}

interface NotificationGrpcServiceInterface {
  sendEmail(data: SendEmailRequest): Observable<SendEmailResponse>;
}

@Injectable()
export class NotificationGrpcService implements OnModuleInit {
  private readonly logger = new Logger(NotificationGrpcService.name);
  private notificationService: NotificationGrpcServiceInterface;

  constructor(@Inject(NOTIFICATION_GRPC_PACKAGE) private client: ClientGrpc) {}

  onModuleInit() {
    this.notificationService =
      this.client.getService<NotificationGrpcServiceInterface>(
        'NotificationService',
      );
  }

  async sendEmail(
    templateName: string,
    recipients: string[],
    templateData: Record<string, string>,
    triggeredBy: string,
    referenceId: string,
  ): Promise<SendEmailResponse> {
    try {
      this.logger.log(
        `Calling gRPC sendEmail: template=${templateName}, recipients=${recipients.length}`,
      );

      const result = await lastValueFrom(
        this.notificationService.sendEmail({
          template_name: templateName,
          recipients,
          template_data: templateData,
          triggered_by: triggeredBy,
          reference_id: referenceId,
        }),
      );

      this.logger.log(
        `gRPC sendEmail completed: success=${result.success}, notification_id=${result.notification_id}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`gRPC sendEmail failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Failed to send notification',
        notification_id: '',
      };
    }
  }
}
