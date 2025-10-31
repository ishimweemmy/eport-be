import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

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
  CRONS_SERVICE_PORT: number;

  @Expose()
  @IsString()
  CUSTOMER_SERVICE_API_URL: string;

  @Expose()
  @IsString()
  AI_SERVICE_API_URL: string;

  // Database configuration
  @Expose()
  @IsString()
  DB_HOST: string;

  @Expose()
  @IsNumber()
  DB_PORT: number;

  @Expose()
  @IsString()
  DB_USER: string;

  @Expose()
  @IsString()
  DB_PASS: string;

  @Expose()
  @IsString()
  DB_NAME: string;

  @Expose()
  @IsBoolean()
  DB_SYNCHRONIZE: boolean;

  // RabbitMQ configuration
  @Expose()
  @IsString()
  RABBITMQ_URI: string;
}
