import {
  DynamicModule,
  FactoryProvider,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import IORedis, { RedisOptions, Redis } from 'ioredis';

export const IORedisKey = 'IOredis';
type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  onclientReady?: (client: Redis) => void;
};

type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class RedisModule {
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider = {
      provide: IORedisKey,
      useFactory: async (...args: any[]) => {
        const { connectionOptions, onclientReady } = await useFactory(...args);
        const client = await new IORedis(connectionOptions);
        onclientReady(client);
        return client;
      },
      inject,
    };
    return {
      module: RedisModule,
      imports,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
