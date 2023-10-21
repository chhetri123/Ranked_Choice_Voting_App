import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, SocketWithAuth } from './types';
import { WsUnauthorizedException } from 'src/exception/ws-exception';

@Injectable()
export class GatewayAdminGuard implements CanActivate {
  private readonly logger = new Logger(GatewayAdminGuard.name);
  constructor(
    private readonly pollsService: PollsService,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithAuth = context
      .switchToWs()
      .getClient<SocketWithAuth>();

    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];
    if (!token) {
      this.logger.error('No token provided');
      throw new WsUnauthorizedException('No token provided');
    }
    try {
      const payLoad = this.jwtService.verify<AuthPayload & { sub: string }>(
        token,
      );
      this.logger.debug(`Validating admins using token playload`, payLoad);

      const { pollID, sub } = payLoad;
      const poll = await this.pollsService.getPoll(pollID);
      if (sub !== poll.adminID) {
        throw new WsUnauthorizedException(`Admin privileges required`);
      }
      return true;
    } catch (error) {
      throw new WsUnauthorizedException('Admin privilages required');
    }
  }
}
