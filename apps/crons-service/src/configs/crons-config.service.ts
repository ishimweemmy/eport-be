import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppEnvironment,
  EnvironmentVariables,
} from '@crons-service/configs/dto/env-variables.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class CronsConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get port(): number {
    return this.configService.getOrThrow('CRONS_SERVICE_PORT');
  }

  get environment(): AppEnvironment {
    return this.configService.getOrThrow('NODE_ENV');
  }

  get customerServiceApiUrl(): string {
    return this.configService.getOrThrow('CUSTOMER_SERVICE_API_URL');
  }

  get aiServiceApiUrl(): string {
    return this.configService.getOrThrow('AI_SERVICE_API_URL');
  }

  get dbHost(): string {
    return this.configService.getOrThrow('DB_HOST');
  }

  get dbPort(): number {
    return this.configService.getOrThrow('DB_PORT');
  }

  get dbUser(): string {
    return this.configService.getOrThrow('DB_USER');
  }

  get dbPass(): string {
    return this.configService.getOrThrow('DB_PASS');
  }

  get dbName(): string {
    return this.configService.getOrThrow('DB_NAME');
  }

  get dbSynchronize(): boolean {
    return this.configService.getOrThrow('DB_SYNCHRONIZE');
  }

  get rabbitmqUri(): string {
    return this.configService.getOrThrow('RABBITMQ_URI');
  }

  getPostgresInfo(): TypeOrmModuleOptions {
    return {
      name: 'default',
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.dbPass,
      database: this.dbName,
      entities: [
        'dist/apps/customer-service/**/*.entity.js',
        'dist/apps/crons-service/**/*.entity.js',
      ],
      synchronize: this.environment !== AppEnvironment.Production,
      cache: false,
      logging: this.environment === AppEnvironment.Development,
      namingStrategy: new SnakeNamingStrategy(),
      extra: {
        timezone: 'Africa/Kigali', // UTC+2 timezone
      },
    };
  }
}
