import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IORedisKey } from 'src/redis.module';
import { AddParticipantData, CreatePollData } from './types';
import { Poll } from 'shared';
@Injectable()
export class PollsRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('POLL_DURATION');
  }

  async createPoll({
    pollID,
    topic,
    votesPerVoter,
    userID,
  }: CreatePollData): Promise<Poll> {
    const initialPoll = {
      id: pollID,
      topic,
      votesPerVoter,
      participants: {},
      adminID: userID,
    };
    this.logger.log(
      `Creating new poll ${JSON.stringify(initialPoll, null, 2)} with TTL ${
        this.ttl
      }`,
    );

    const key = `polls:${pollID}`;
    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialPoll)],
          ['expire', key, this.ttl],
        ])
        .exec();
      return initialPoll;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getPoll(pollID: string): Promise<Poll | null> {
    this.logger.log(`Getting poll ${pollID}`);
    const key = `polls:${pollID}`;
    try {
      const currentPoll = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );
      this.logger.verbose(currentPoll);
      return JSON.parse(currentPoll);
    } catch (e) {
      this.logger.error(`Failed to get poll ${pollID}`);
      throw e;
    }
  }

  async addParticipant({
    pollID,
    userID,
    name,
  }: AddParticipantData): Promise<Poll> {
    this.logger.log(
      `Attemping to addParticipant with userId/name: ${userID}/${name} to poll ${pollID}`,
    );
    const key = `polls:${pollID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(name),
      );
      const pollJSON = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );
      const poll = JSON.parse(pollJSON) as Poll;

      this.logger.debug(
        `Current Participants for pollID: ${pollID}`,
        poll.participants,
      );

      return poll;
    } catch (e) {
      this.logger.error(
        `Failed to add participant ${userID}/${name} to poll ${pollID}`,
      );
      throw e;
    }
  }
}
