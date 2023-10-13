import { Injectable, Logger } from '@nestjs/common';
import { CreatePollFields, ReJoinPollFields, JoinPollFields } from './types';
import { createPollID, createUserID } from 'src/ids';
import { PollsRepository } from './polls.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);
  constructor(
    private readonly pollsRepository: PollsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getSignedToken(pollID: string, name: string, userID: string) {
    this.logger.debug(`Creating token string for p
    llID : ${pollID} and userID : ${userID}`);

    const signedString = this.jwtService.sign(
      {
        pollID,
        name,
      },
      {
        subject: userID,
      },
    );
    return signedString;
  }
  async createPoll(fields: CreatePollFields) {
    const userID = createUserID();
    const pollID = createPollID();

    const createdPoll = await this.pollsRepository.createPoll({
      ...fields,
      userID,
      pollID,
    });

    const signedToken = await this.getSignedToken(pollID, fields.name, userID);
    return {
      poll: createdPoll,
      accessToken: signedToken,
    };
  }

  async joinPoll(fields: JoinPollFields) {
    const userID = createUserID();
    this.logger.debug(`
    Fetching poll with ID  for the user ${userID}
    `);
    const joinedPoll = await this.pollsRepository.getPoll(fields.pollID);
    const joinedToken = await this.getSignedToken(
      joinedPoll.id,
      fields.name,
      userID,
    );
    return {
      poll: joinedPoll,
      accessToken: joinedToken,
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
