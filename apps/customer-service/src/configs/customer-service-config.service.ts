import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppEnvironment, EnvironmentVariables } from './dto/env-variables.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { MinioModuleOptions } from '@customer-service/modules/minio-client/types/all.types';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { IAuthConfig } from '@app/common/auth';

@Injectable()
export class CoreServiceConfigService implements IAuthConfig {
  // I couldn't find a better name for this class
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get port(): number {
    return this.configService.getOrThrow('CUSTOMER_SERVICE_PORT');
  }

  get environment(): AppEnvironment {
    return this.configService.getOrThrow('NODE_ENV');
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

  get jwtSecret(): string {
    return this.configService.getOrThrow('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.getOrThrow('JWT_EXPIRES_IN');
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN');
  }

  get dbSynchronize(): boolean {
    return this.configService.getOrThrow('DB_SYNCHRONIZE');
  }

  get rabbitmqUri(): string {
    return this.configService.getOrThrow('RABBITMQ_URI');
  }

  get rabbitMqNotificationsQueue(): string {
    return this.configService.getOrThrow('RABBIT_MQ_NOTIFICATIONS_QUEUE');
  }

  get integrationServiceGrpcUrl(): string {
    return this.configService.getOrThrow('INTEGRATION_SERVICE_GRPC_URL');
  }

  get GrpcHost(): string {
    return this.configService.getOrThrow('GRPC_HOST');
  }

  get GrpcPort(): number {
    return this.configService.getOrThrow('GRPC_PORT');
  }
  get minioPort(): string {
    return this.configService.getOrThrow('MINIO_PORT');
  }
  get minioAccessKey(): string {
    return this.configService.getOrThrow('MINIO_ACCESS_KEY');
  }
  get minioEndPoint(): string {
    return this.configService.getOrThrow('MINIO_ENDPOINT');
  }
  get minioSecretKey(): string {
    return this.configService.getOrThrow('MINIO_SECRET_KEY');
  }
  get minioBucket(): string {
    return this.configService.getOrThrow('MINIO_BUCKET');
  }
  get minioUsessl(): string {
    return this.configService.getOrThrow('MINIO_USE_SSL');
  }
  get clientUrl(): string {
    return this.configService.getOrThrow('CLIENT_URL');
  }

  get getRedisUrl(): string {
    return this.configService.getOrThrow('REDIS_URL');
  }
  get adminSecurityCode(): string {
    return this.configService.getOrThrow('ADMIN_REG_CODE');
  }
  get minioUrl(): string {
    return this.configService.getOrThrow('MINIO_URL');
  }
  get defaultPassword(): string {
    return this.configService.getOrThrow('DEFAULT_PASSWORD');
  }

  get encryptionKey(): string {
    return this.configService.getOrThrow('ENCRYPTION_KEY');
  }

  get aiServiceUrl(): string {
    return this.configService.getOrThrow('AI_SERVICE_URL');
  }

  get contactEmail(): string {
    return this.configService.getOrThrow('CONTACT_EMAIL');
  }
  get contactPhone(): string {
    return this.configService.getOrThrow('CONTACT_PHONE');
  }
  get clientAppUrl(): string {
    return this.configService.getOrThrow('CLIENT_APP_URL');
  }
  get misLoginApi(): string {
    return this.configService.getOrThrow('MIS_LOGIN_API');
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
      migrations: ['dist/apps/customer-service/db/migrations/**/*.js'],
      entities: ['dist/apps/customer-service/**/*.entity.js'],
      synchronize: this.environment !== AppEnvironment.Production, // This should be false otherwise we might be in a risk of losing data in production.
      cache: false,
      migrationsRun: false,
      dropSchema: false, // This should be false otherwise we might be in a risk of losing data in production.
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
      extra: {
        timezone: 'UTC+2', // Set timezone to UTC to match server time
      },
    };
  }
  getRedisInfo(): RedisModuleOptions {
    return {
      type: 'single',
      url: this.getRedisUrl,
    } as RedisModuleOptions;
  }
  getMinioInfo(): MinioModuleOptions {
    return {
      endpoint: this.minioEndPoint,
      port: this.minioPort,
      accessKey: this.minioAccessKey,
      secretKey: this.minioSecretKey,
      bucket: this.minioBucket,
    };
  }
}
