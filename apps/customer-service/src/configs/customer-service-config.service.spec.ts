import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CoreServiceConfigService } from './customer-service-config.service';
import { AppEnvironment } from './dto/env-variables.dto';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

describe('CoreServiceConfigService', () => {
  let service: CoreServiceConfigService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreServiceConfigService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoreServiceConfigService>(CoreServiceConfigService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMinioInfo', () => {
    it('should return minio configuration', () => {
      const mockConfig = {
        endpoint: 'localhost',
        port: '9000',
        accessKey: 'test-key',
        secretKey: 'test-secret',
        bucket: 'test-bucket',
      };

      jest
        .spyOn(configService, 'getOrThrow')
        .mockImplementation((key: string) => {
          const configMap = {
            MINIO_ENDPOINT: mockConfig.endpoint,
            MINIO_PORT: mockConfig.port,
            MINIO_ACCESS_KEY: mockConfig.accessKey,
            MINIO_SECRET_KEY: mockConfig.secretKey,
            MINIO_BUCKET: mockConfig.bucket,
          };
          return configMap[key];
        });

      const result = service.getMinioInfo();
      expect(result).toEqual(mockConfig);
    });
  });

  describe('getPostgresInfo', () => {
    it('should return postgres configuration', () => {
      const mockConfig = {
        host: 'localhost',
        port: 5432,
        username: 'test-user',
        password: 'test-password',
        database: 'test-db',
      };

      jest
        .spyOn(configService, 'getOrThrow')
        .mockImplementation((key: string) => {
          const configMap = {
            DB_HOST: mockConfig.host,
            DB_PORT: mockConfig.port,
            DB_USER: mockConfig.username,
            DB_PASS: mockConfig.password,
            DB_NAME: mockConfig.database,
            NODE_ENV: AppEnvironment.Development,
          };
          return configMap[key];
        });

      const result = service.getPostgresInfo();
      expect(result).toEqual({
        name: 'default',
        type: 'postgres',
        host: mockConfig.host,
        port: mockConfig.port,
        username: mockConfig.username,
        password: mockConfig.password,
        database: mockConfig.database,
        migrations: ['dist/apps/customer-service/db/migrations/**/*.js'],
        entities: ['dist/apps/customer-service/**/*.entity.js'],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        cache: false,
        logging: false,
        namingStrategy: new SnakeNamingStrategy(),
      });
    });
  });
});
