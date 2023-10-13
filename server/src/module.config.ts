import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis.module';
import { Redis } from 'ioredis';
import { JwtModule } from '@nestjs/jwt';

export const redisModule = RedisModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisModule');
    return {
      connectionOptions: {
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      },

      onclientReady: (client: Redis) => {
        logger.log('Redis client ready');
        client.on('ready', () => {
          logger.log(
            `Connected to redis on ${client.options.host}:${client.options.port}`,
          );
        });
        client.on('error', (err) => {
          logger.error('Redis client connection error: ' + err.message);
        });
      },
    };
  },
});

export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: {
      expiresIn: parseInt(configService.get('POLL_DURATION')),
    },
  }),
});
