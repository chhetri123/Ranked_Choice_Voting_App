import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './dtos';
import { PollsService } from './polls.service';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}
  @Post()
  async create(@Body() createPollDto: CreatePollDto) {
    const result = this.pollsService.createPoll(createPollDto);
    return result;
  }

  @Post('/join')
  async join(@Body() JoinPollDto: JoinPollDto) {
    const result = this.pollsService.joinPoll(JoinPollDto);
    return result;
  }

  @Post('/rejoin')
  async rejoin() {
    const result = this.pollsService.rejoinPoll({
      pollID: '',
      name: '',
      userID: '',
    });
    return result;
  }
}
