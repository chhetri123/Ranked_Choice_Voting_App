import { Injectable } from '@nestjs/common';
import { CreatePollFields, ReJoinPollFields, JoinPollFields } from './types';
import { createPollID, createUserID } from 'src/ids';

@Injectable()
export class PollsService {
  async createPoll(fields: CreatePollFields) {
    const userID = createUserID();
    const pollID = createPollID();
    return {
      ...fields,
      userID,
      pollID,
    };
  }
  async joinPoll(fields: JoinPollFields) {
    const userID = createUserID();
    return {
      ...fields,
      userID,
    };
  }
    async rejoinPoll(fields: ReJoinPollFields) {
      return fields;
  }
}
