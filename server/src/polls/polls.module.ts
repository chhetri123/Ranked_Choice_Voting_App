import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollModule {}
