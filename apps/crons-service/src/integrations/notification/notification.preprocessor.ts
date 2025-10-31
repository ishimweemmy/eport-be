import { Injectable, Logger } from '@nestjs/common';
import {
  EMAIL_TEMPLATES_CONFIG,
  EmailTemplateDataMap,
  EmailTemplates,
} from '@customer-service/configs/email-template-configs/email-templates.config';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotificationService } from '@crons-service/integrations/notification/notification.service';
import { compileTemplate } from '@customer-service/configs/email-template-configs/email-templates-compiler.config';

@Injectable()
export class NotificationPreProcessor {
  private readonly logger = new Logger(NotificationPreProcessor.name);

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Sends a templated email to the specified recipients.
   */
  async sendTemplateEmail<T extends EmailTemplates>(
    template: T,
    recipients: string[],
    data?: EmailTemplateDataMap[T],
  ): Promise<void> {
    const config = EMAIL_TEMPLATES_CONFIG[template];

    if (config.dto && data) {
      // Validate using class-validator
      const dtoClass = config.dto as ClassConstructor<typeof data>;
      const dto = plainToInstance(dtoClass, data);
      const errors = await validate(dto);

      if (errors.length > 0) {
        this.logger.error(
          `Invalid data for template ${template}: ${JSON.stringify(errors)}`,
        );
        return;
      }
    }

    const htmlContent = compileTemplate(template, data);
    await this.notificationService.sendEmailNotification({
      emailRecipients: recipients,
      subject: config.subject,
      htmlTemplate: htmlContent,
    });
  }
}
