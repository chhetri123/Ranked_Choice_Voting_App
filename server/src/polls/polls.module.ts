import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { redisModule } from 'src/module.config';
import { PollsRepository } from './polls.repository';
import { jwtModule } from 'src/module.config';

@Module({
  imports: [ConfigModule, redisModule, jwtModule],
  controllers: [PollsController],
  providers: [PollsService, PollsRepository],
})
export class PollModule {}
