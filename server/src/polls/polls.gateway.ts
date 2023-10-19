import {
  BadRequestException,
  Logger,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from './types';
import { WsBadRequestException } from 'src/exception/ws-exception';
import { WsCatchAllFilter } from 'src/exception/ws-catch-all-filter';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'polls',
})
export class PollGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollGateway.name);
  constructor(private readonly pollsService: PollsService) {}

  @WebSocketServer() io: Namespace;

  afterInit() {
    this.logger.log('Gateway initialized');
  }
  handleConnection(client: SocketWithAuth) {
    const { sockets } = this.io;
    this.logger.debug(
      `socket connected with userId: ${client.userID} ,pollId: ${client.pollID}, and name: ${client.name}`,
    );
    this.logger.log(`WS Client with id :${client.id} is connected `);
    this.logger.debug(`Number of sockets connected :${sockets.size}`);
    this.io.emit('Hello', client.id);
  }
  handleDisconnect(client: SocketWithAuth) {
    const { sockets } = this.io;
    this.logger.debug(
      `socket Disconnected with userId: ${client.userID} ,pollId: ${client.pollID}, and name: ${client.name}`,
    );
    this.logger.log(`WS Client with id :${client.id} is disconnected `);
    this.logger.debug(`Number of sockets connected :${sockets.size}`);
  }
  @SubscribeMessage('test')
  async test() {
    throw new BadRequestException('Test Error');
  }
}
