import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppEnvironment,
  EnvironmentVariables,
} from '@admin-service/configs/dto/env-variables.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { IAuthConfig } from '@app/common/auth';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';

@Injectable()
export class AdminConfigService implements IAuthConfig {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get port(): number {
    return this.configService.getOrThrow('PORT');
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

  get jwtSecretKey(): string {
    return this.configService.getOrThrow('JWT_SECRET');
  }

  // Alias for compatibility with customer-service guards
  get jwtSecret(): string {
    return this.jwtSecretKey;
  }

  get jwtExpiryTime(): string {
    return this.configService.getOrThrow('JWT_EXPIRES_IN');
  }

  get jwtRefreshSecretKey(): string {
    return this.configService.getOrThrow('JWT_REFRESH_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.jwtRefreshSecretKey;
  }

  get jwtRefreshExpiryTime(): string {
    return this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN');
  }

  get notificationGrpcUrl(): string {
    return this.configService.getOrThrow('NOTIFICATION_GRPC_URL');
  }

  get dbSynchronize(): boolean {
    return this.configService.getOrThrow('DB_SYNCHRONIZE');
  }

  get getRedisUrl(): string {
    return this.configService.getOrThrow('REDIS_URL');
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
      migrations: ['dist/apps/admin-service/db/migrations/**/*.js'],
      entities: [
        'dist/apps/admin-service/**/*.entity.js',
        'dist/apps/customer-service/**/*.entity.js', // Include customer-service entities
      ],
      synchronize: this.environment !== AppEnvironment.Production,
      cache: false,
      migrationsRun: false,
      dropSchema: false,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
      extra: {
        timezone: 'UTC+2',
      },
    };
  }

  getRedisInfo(): RedisModuleOptions {
    return {
      type: 'single',
      url: this.getRedisUrl,
    } as RedisModuleOptions;
  }
}
