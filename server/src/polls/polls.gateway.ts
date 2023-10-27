import {
  BadRequestException,
  Logger,
  UseFilters,
  UseGuards,
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
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from './types';
import { WsBadRequestException } from 'src/exception/ws-exception';
import { WsCatchAllFilter } from 'src/exception/ws-catch-all-filter';
import { GatewayAdminGuard } from './gateway-admin.guard';
import { NominationDto } from './dtos';

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
  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participant with id: ${id} from poll with id: ${client.pollID}`,
    );
    const updatedPolls = await this.pollsService.removeParticipant({
      pollID: client.pollID,
      userID: id,
    });
    if (updatedPolls)
      this.io.to(client.pollID).emit('updatePolls', updatedPolls);
  }

  @SubscribeMessage('nominate')
  async nominate(
    @MessageBody() nomination: NominationDto,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add nomination for user ${client.userID} to pollID ${client.pollID} \n ${nomination.text}`,
    );

    const updatedPolls = await this.pollsService.addNomination({
      pollID: client.pollID,
      userID: client.userID,
      text: nomination.text,
    });

    this.io.to(client.pollID).emit('updatePolls', updatedPolls);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_nomination')
  async removeNomination(
    @MessageBody('id') nominationID: string,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to remove nomination ${nominationID} from poll ${client.pollID}`,
    );

    const updatePoll = await this.pollsService.removeNomination(
      client.pollID,
      nominationID,
    );

    this.io.to(client.pollID).emit('updatePolls', updatePoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('start_vote')
  async startVote(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(
      `Attempting to start the voting for poll ${client.pollID}`,
    );
    const updatedPoll = await this.pollsService.startPoll(client.pollID);

    this.io.to(client.pollID).emit('updatePolls', updatedPoll);
  }

  @SubscribeMessage('submit_rankings')
  async submitRankings(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('rankings') rankings: string[],
  ): Promise<void> {
    const updatedPoll = await this.pollsService.submitRankings({
      pollID: client.pollID,
      userID: client.userID,
      rankings,
    });
    this.io.to(client.pollID).emit('updatePolls', updatedPoll);
  }
}
