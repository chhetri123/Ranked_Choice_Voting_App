import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Namespace, Socket } from 'socket.io';

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
  handleConnection(client: Socket) {
    const { sockets } = this.io;
    this.logger.log(`WS Client with id :${client.id} is connected `);
    this.logger.debug(`Number of sockets connected :${sockets.size}`);
    this.io.emit('Hello', client.id);
  }
  handleDisconnect(client: Socket) {
    const { sockets } = this.io;

    this.logger.log(`WS Client with id :${client.id} is disconnected `);
    this.logger.debug(`Number of sockets connected :${sockets.size}`);
  }
}
