export class SendEmailGrpcRequest {
  template_name: string;
  recipients: string[];
  template_data: Record<string, string>;
  triggered_by: string;
  reference_id: string;
}

export class SendAdminAlertGrpcRequest {
  alert_type: string;
  message: string;
  data: Record<string, string>;
}

export class SendEmailGrpcResponse {
  success: boolean;
  message: string;
  notification_id: string;
}
