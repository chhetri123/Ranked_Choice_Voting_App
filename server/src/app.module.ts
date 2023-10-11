import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollModule } from './polls/polls.module';

@Module({
  imports: [ConfigModule.forRoot(), PollModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
