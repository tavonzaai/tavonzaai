import {
  DynamicModule,
  Global,
  Inject,
  Injectable,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { StorageConfig } from './types.js';
import { loadStorageConfig } from './config.js';
import { S3StorageService } from './s3.service.js';

export const STORAGE_CONFIG = Symbol('STORAGE_CONFIG');
export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

/**
 * NestJS Injectable StorageService
 * Wraps S3StorageService with full dependency injection support.
 */
@Injectable()
export class StorageService extends S3StorageService {
  constructor(@Inject(STORAGE_CONFIG) config: StorageConfig) {
    super(config);
  }
}

export interface StorageModuleOptionsFactory {
  createStorageOptions(): Promise<StorageConfig> | StorageConfig;
}

export interface StorageModuleAsyncOptions {
  imports?: any[];
  useExisting?: Type<StorageModuleOptionsFactory>;
  useClass?: Type<StorageModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<StorageConfig> | StorageConfig;
  inject?: any[];
}

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_CONFIG,
      useFactory: () => loadStorageConfig(),
    },
    {
      provide: STORAGE_SERVICE,
      useExisting: StorageService,
    },
    StorageService,
  ],
  exports: [STORAGE_CONFIG, STORAGE_SERVICE, StorageService],
})
export class StorageModule {
  /**
   * Synchronous dynamic registration with custom configuration
   */
  public static forRoot(config?: Partial<StorageConfig>): DynamicModule {
    const storageConfigProvider: Provider = {
      provide: STORAGE_CONFIG,
      useValue: loadStorageConfig(config),
    };

    return {
      module: StorageModule,
      global: true,
      providers: [
        storageConfigProvider,
        {
          provide: STORAGE_SERVICE,
          useExisting: StorageService,
        },
        StorageService,
      ],
      exports: [STORAGE_CONFIG, STORAGE_SERVICE, StorageService],
    };
  }

  /**
   * Asynchronous dynamic registration (e.g. from ConfigService or Vault)
   */
  public static forRootAsync(options: StorageModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: StorageModule,
      global: true,
      imports: options.imports || [],
      providers: [
        ...asyncProviders,
        {
          provide: STORAGE_SERVICE,
          useExisting: StorageService,
        },
        StorageService,
      ],
      exports: [STORAGE_CONFIG, STORAGE_SERVICE, StorageService],
    };
  }

  private static createAsyncProviders(options: StorageModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: STORAGE_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass || options.useExisting) {
      const targetClass = options.useClass || options.useExisting!;
      return [
        {
          provide: targetClass,
          useClass: targetClass,
        },
        {
          provide: STORAGE_CONFIG,
          useFactory: async (optionsFactory: StorageModuleOptionsFactory) =>
            optionsFactory.createStorageOptions(),
          inject: [targetClass],
        },
      ];
    }

    return [
      {
        provide: STORAGE_CONFIG,
        useFactory: () => loadStorageConfig(),
      },
    ];
  }
}
