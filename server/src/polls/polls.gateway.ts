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

  // Handle the connection to the websocket server
  async handleConnection(client: SocketWithAuth) {
    const { sockets, adapter } = this.io;
    this.logger.debug(
      `socket connected with userId: ${client.userID} ,pollId: ${client.pollID}, and name: ${client.name}`,
    );
    this.logger.log(`WS Client with id :${client.id} is connected `);
    this.logger.debug(`Number of sockets connected :${sockets.size}`);

    const roomName = client.pollID;
    await client.join(roomName);

    const connectedClient = adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(
      `userID :${client.userID} joined room with name :{roomName}`,
    );
    this.logger.debug(
      `Number of connected clients in room ${roomName} is :${connectedClient}`,
    );

    const updatedPolls = await this.pollsService.addParticipant({
      pollID: client.pollID,
      userID: client.userID,
      name: client.name,
    });

    this.io.to(roomName).emit('updatePolls', updatedPolls);
  }

  //

  // Handle the disconnection from server
  async handleDisconnect(client: SocketWithAuth) {
    const { sockets, adapter } = this.io;
    const { pollID, userID } = client;
    const updatedPolls = await this.pollsService.removeParticipant({
      pollID,
      userID,
    });

    const roomName = client.pollID;
    const clientCount = adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.debug(
      `socket Disconnected with userId: ${client.userID} ,pollId: ${client.pollID}, and name: ${client.name}`,
    );
    this.logger.log(`WS Client with id :${client.id} is disconnected `);
    this.logger.debug(
      `Number of sockets connected in room ${roomName} is :${clientCount}`,
    );

    if (updatedPolls) {
      this.io.to(roomName).emit('updatePolls', updatedPolls);
    }
  }

  // /
  @SubscribeMessage('test')
  async test() {
    throw new BadRequestException('Test Error');
  }
}
