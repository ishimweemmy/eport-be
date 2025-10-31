import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum AppEnvironment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

@Exclude()
export class EnvironmentVariables {
  @Expose()
  @IsEnum(AppEnvironment)
  NODE_ENV: AppEnvironment;

  @Expose()
  @IsNumber()
  PORT: number;

  // Database Configuration
  @Expose()
  DB_HOST: string;

  @Expose()
  DB_PORT: number;

  @Expose()
  DB_USER: string;

  @Expose()
  DB_PASS: string;

  @Expose()
  DB_NAME: string;

  @Expose()
  DB_SYNCHRONIZE: boolean;

  // JWT Configuration
  @Expose()
  JWT_SECRET: string;

  @Expose()
  JWT_EXPIRES_IN: string;

  @Expose()
  JWT_REFRESH_SECRET: string;

  @Expose()
  JWT_REFRESH_EXPIRES_IN: string;

  // Redis Configuration
  @Expose()
  REDIS_URL: string;

  // Notification Service gRPC
  @Expose()
  NOTIFICATION_GRPC_URL: string;
}
