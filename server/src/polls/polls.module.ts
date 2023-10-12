import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { redisModule } from 'src/module.config';
import { PollsRepository } from './polls.repository';

@Module({
  imports: [ConfigModule, redisModule],
  controllers: [PollsController],
  providers: [PollsService, PollsRepository],
})
export class PollModule {}
