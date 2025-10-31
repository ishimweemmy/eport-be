import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport, ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';
import { AdminConfigService } from '@admin-service/configs/admin-config.service';
import { AdminConfigModule } from '@admin-service/configs/admin-config.module';
import { NotificationGrpcService } from '@admin-service/integrations/notification/notification-grpc.service';

export const NOTIFICATION_GRPC_PACKAGE = 'notification';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_GRPC_PACKAGE,
        imports: [AdminConfigModule],
        inject: [AdminConfigService],
        useFactory: (configService: AdminConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'notification',
            protoPath: join(process.cwd(), 'assets/proto/notification.proto'),
            url: configService.notificationGrpcUrl,
          },
        }),
      },
    ]),
  ],
  providers: [
    {
      provide: NotificationGrpcService,
      useFactory: (client: ClientGrpc) => {
        return new NotificationGrpcService(client);
      },
      inject: [NOTIFICATION_GRPC_PACKAGE],
    },
  ],
  exports: [ClientsModule, NotificationGrpcService],
})
export class NotificationGrpcModule {}
