import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './dtos';
import { PollsService } from './polls.service';
import { ControllerAuthGuard } from './controller-auth.guard';
import { RequestWithAuth } from './types';

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

  @UseGuards(ControllerAuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() request: RequestWithAuth) {
    const { userID, pollID, name } = request;
    const result = this.pollsService.rejoinPoll({
      pollID,
      name,
      userID,
    });
    return result;
  }
}
