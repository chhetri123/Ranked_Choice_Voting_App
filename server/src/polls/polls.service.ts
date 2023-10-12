import { Injectable, Logger } from '@nestjs/common';
import { CreatePollFields, ReJoinPollFields, JoinPollFields } from './types';
import { createPollID, createUserID } from 'src/ids';
import { PollsRepository } from './polls.repository';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);
  constructor(private readonly pollsRepository: PollsRepository) {}

  async createPoll(fields: CreatePollFields) {
    const userID = createUserID();
    const pollID = createPollID();

    const createdPoll = await this.pollsRepository.createPoll({
      ...fields,
      userID,
      pollID,
    });
    return {
      poll: createdPoll,
    };
  }

  async joinPoll(fields: JoinPollFields) {
    const userID = createUserID();
    this.logger.debug(`
    Fetching poll with ID  for the user ${userID}
    `);
    const joinPoll = await this.pollsRepository.getPoll(fields.pollID);

    return {
      poll: joinPoll,
    };
  }
  async rejoinPoll(fields: ReJoinPollFields) {
    this.logger.debug(`
    Rejoining poll with ID  ${fields.pollID} for user with ID ${fields.userID} with name ${fields.name}`);

    const joinedPoll = await this.pollsRepository.addParticipant(fields);
    return {
      poll: joinedPoll,
    };
  }
}
