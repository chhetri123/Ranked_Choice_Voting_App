import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { redisModule } from 'src/module.config';

@Module({
  imports: [ConfigModule.forRoot(), redisModule],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollModule {}
