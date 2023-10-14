import { Logger } from '@nestjs/common';
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { PollsService } from './polls.service';

@WebSocketGateway({
  namespace: 'polls',
})
export class PollGateway implements OnGatewayInit {
  private readonly logger = new Logger(PollGateway.name);
  constructor(private readonly pollsService: PollsService) {}

  afterInit() {
    this.logger.log('Gateway initialized');
  }
}
