import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  PATTERNS,
  QUEUE_HANDLERS,
} from '@app/common/constants/rabbitmq-constants';
import { EmailQueuePayload } from '@app/common/interfaces/shared-queues/email-payload.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@Inject(QUEUE_HANDLERS.EMAIL) private emailClient: ClientProxy) {}

  /**
   * Sends an email notification via the email queue.
   */
  async sendEmailNotification(payload: EmailQueuePayload): Promise<void> {
    try {
      this.emailClient.emit(PATTERNS.SEND_EMAIL, payload);
      this.logger.log(
        `Email queued: ${payload.htmlTemplate} to ${payload.emailRecipients.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
    }
  }
}
