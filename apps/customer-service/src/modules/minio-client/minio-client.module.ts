import { Global, Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { CoreServiceConfigService } from '@customer-service/configs/customer-service-config.service';
import { MinioClientController } from './mnio-client.controller';

@Global()
@Module({
  providers: [MinioClientService, CoreServiceConfigService],
  controllers: [MinioClientController],
  exports: [MinioClientService],
})
export class MinioClientModule {}
