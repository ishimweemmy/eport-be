import { Injectable, Logger } from '@nestjs/common';
import { EmailNotifierService } from '../email-notifier/email-notifier.service';
import { NotificationService } from './notification.service';
import { ENotificationType } from '@app/common/enums/notification-type.enum';
import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
import {
  EMAIL_TEMPLATES_CONFIG,
  EmailTemplates,
} from '@customer-service/configs/email-template-configs/email-templates.config';
import {
  SendEmailGrpcRequest,
  SendEmailGrpcResponse,
  SendAdminAlertGrpcRequest,
} from './dto/send-email-grpc.dto';

@Injectable()
export class NotificationGrpcService {
  private readonly logger = new Logger(NotificationGrpcService.name);
  private readonly templateCache: Map<string, HandlebarsTemplateDelegate> =
    new Map();

  constructor(
    private readonly emailNotifierService: EmailNotifierService,
    private readonly notificationService: NotificationService,
  ) {
    this.initializeTemplates();
  }

  /**
   * Initialize and cache Handlebars templates on service startup
   */
  private initializeTemplates(): void {
    const templatesPath = join(
      process.cwd(),
      'apps/notification-service/src/modules/email-notifier/templates',
    );

    try {
      // Pre-compile critical templates
      const criticalTemplates = [
        EmailTemplates.LOAN_APPROVED,
        EmailTemplates.LOAN_REJECTED,
        EmailTemplates.LOAN_DISBURSED,
        EmailTemplates.CREDIT_LIMIT_UPDATED,
        EmailTemplates.CREDIT_SCORE_UPDATED,
        EmailTemplates.ACCOUNT_SUSPENDED,
        EmailTemplates.ACCOUNT_UNSUSPENDED,
      ];

      criticalTemplates.forEach((template) => {
        try {
          const templatePath = join(templatesPath, `${template}.html`);
          const templateContent = readFileSync(templatePath, 'utf-8');
          this.templateCache.set(template, Handlebars.compile(templateContent));
        } catch (error) {
          this.logger.warn(
            `Template ${template} not found or failed to compile: ${error.message}`,
          );
        }
      });

      this.logger.log(`Initialized ${this.templateCache.size} email templates`);
    } catch (error) {
      this.logger.error(
        `Failed to initialize templates: ${error.message}`,
        error.stack,
      );
    }
  }

  async sendEmail(data: SendEmailGrpcRequest): Promise<SendEmailGrpcResponse> {
    const startTime = Date.now();
    this.logger.log(
      `gRPC SendEmail: template=${data.template_name}, recipients=${data.recipients.length}, ref=${data.reference_id}`,
    );

    try {
      // Get template configuration
      const templateConfig = EMAIL_TEMPLATES_CONFIG[data.template_name];
      if (!templateConfig) {
        throw new Error(`Unknown template: ${data.template_name}`);
      }

      const subject = templateConfig.subject;
      const htmlContent = this.compileTemplate(
        data.template_name,
        data.template_data,
      );

      // Send emails to all recipients
      const sendPromises = data.recipients.map(async (recipient) => {
        try {
          await this.emailNotifierService.sendEmail(
            recipient,
            subject,
            htmlContent,
          );

          // Create notification record
          await this.notificationService.create({
            type: ENotificationType.EMAIL,
            receiverUserId: null,
            subject,
            content: `Email sent using template: ${data.template_name}`,
            messageType: ENotificationMessageType.TRANSACTIONAL,
            metadata: {
              templateName: data.template_name,
              recipient,
              triggeredBy: data.triggered_by,
              referenceId: data.reference_id,
              sentAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to send email to ${recipient}: ${error.message}`,
          );
          throw error;
        }
      });

      await Promise.all(sendPromises);

      const duration = Date.now() - startTime;
      this.logger.log(
        `gRPC SendEmail completed: ${data.recipients.length} emails sent in ${duration}ms`,
      );

      return {
        success: true,
        message: `Email sent successfully to ${data.recipients.length} recipient(s)`,
        notification_id: data.reference_id || this.generateNotificationId(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `gRPC SendEmail failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: error.message || 'Failed to send email',
        notification_id: '',
      };
    }
  }

  async sendAdminAlert(
    data: SendAdminAlertGrpcRequest,
  ): Promise<SendEmailGrpcResponse> {
    this.logger.log(
      `gRPC SendAdminAlert: type=${data.alert_type}, message=${data.message}`,
    );

    try {
      // Create notification record for admin alert
      const notification = await this.notificationService.create({
        type: ENotificationType.PLATFORM,
        receiverUserId: null,
        subject: `Admin Alert: ${data.alert_type}`,
        content: data.message,
        messageType: ENotificationMessageType.ADMINISTRATIVE,
        metadata: {
          alertType: data.alert_type,
          data: data.data,
          timestamp: new Date().toISOString(),
        },
      });

      // TODO: Implement additional admin alert mechanisms
      // - Send to Slack channel
      // - Send push notification to admin dashboard
      // - Send email to admin email addresses

      this.logger.log(
        `Admin alert logged with notification ID: ${notification.id}`,
      );

      return {
        success: true,
        message: 'Admin alert logged successfully',
        notification_id: notification.id,
      };
    } catch (error) {
      this.logger.error(
        `gRPC SendAdminAlert failed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: error.message || 'Failed to send admin alert',
        notification_id: '',
      };
    }
  }

  private compileTemplate(
    templateName: string,
    data: Record<string, any>,
  ): string {
    try {
      // Try to use cached template
      let template = this.templateCache.get(templateName);

      if (!template) {
        // Load template on-demand if not cached
        const templatesPath = join(
          process.cwd(),
          'apps/notification-service/src/modules/email-notifier/templates',
        );
        const templatePath = join(templatesPath, `${templateName}.html`);
        const templateContent = readFileSync(templatePath, 'utf-8');
        template = Handlebars.compile(templateContent);
        this.templateCache.set(templateName, template);
      }

      return template(data);
    } catch (error) {
      this.logger.error(
        `Failed to compile template ${templateName}: ${error.message}`,
      );
      // Fallback to basic HTML
      return this.generateFallbackTemplate(templateName, data);
    }
  }

  private generateFallbackTemplate(
    templateName: string,
    data: Record<string, any>,
  ): string {
    const dataHtml = Object.entries(data)
      .map(
        ([key, value]) =>
          `<tr><td style="padding: 8px; font-weight: bold;">${key}:</td><td style="padding: 8px;">${value}</td></tr>`,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notification from Credit Jambo</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px;">
            <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Notification from Credit Jambo</h2>
            <p style="color: #666; margin: 20px 0;">Template: <strong>${templateName}</strong></p>
            <table style="width: 100%; border-collapse: collapse;">
              ${dataHtml}
            </table>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p><strong>Credit Jambo Ltd</strong></p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateNotificationId(): string {
    return `grpc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
