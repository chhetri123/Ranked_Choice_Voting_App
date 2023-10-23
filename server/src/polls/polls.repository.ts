import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IORedisKey } from 'src/redis.module';
import { AddNominationData, AddParticipantData, CreatePollData } from './types';
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

  // Create Poll
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
      nominations: {},
      adminID: userID,
      hasStarted: false,

      //   rankings: {},
      //   results: {},
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
      throw new InternalServerErrorException(
        `Could not create poll ${JSON.stringify(initialPoll, null, 2)}`,
      );
    }
  }

  // GET Polls
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
      throw new InternalServerErrorException(`Failed to get poll ${pollID}`);
    }
  }

  // Add Participant to poll
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

      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to add participant ${userID}/${name} to poll ${pollID}`,
      );
      throw new InternalServerErrorException('Failed to add participant');
    }
  }

  // Removing Participant
  async removeParticipant(pollID: string, userID: string): Promise<Poll> {
    this.logger.log(`removing userID:${userID} from pollID:${pollID}`);

    const key = `polls:${pollID}`;
    const participantPath = `.participants.${userID}`;
    try {
      await this.redisClient.send_command('JSON.DEL', key, participantPath);
      return await this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to remove participant ${userID} from poll ${pollID}`,
        e,
      );
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  // Adding Nominations
  async addNomination({
    pollID,
    nominationID,
    nomination,
  }: AddNominationData): Promise<Poll> {
    this.logger.log(
      `Attemping to addNomination with nominationID: ${nominationID} to poll ${pollID}`,
    );

    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        nominationPath,
        JSON.stringify(nomination),
      );
      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to add nomination ${nominationID} to poll ${pollID}`,
        e,
      );

      throw new InternalServerErrorException('Failed to add nomination');
    }
  }

  // Removing Nomination
  async removeNomination(pollID: string, nominationID: string): Promise<Poll> {
    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;

    try {
      await this.redisClient.send_command('JSON.DEL', key, nominationPath);
      return this.getPoll(pollID);
    } catch (e) {
      this.logger.error(
        `Failed to remove nomination ${nominationID} from poll ${pollID}`,
        e,
      );
      throw new InternalServerErrorException('Failed to remove nomination');
    }
  }
}
