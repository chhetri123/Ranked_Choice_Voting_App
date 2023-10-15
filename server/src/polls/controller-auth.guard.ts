import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ControllerAuthGuard implements CanActivate {
  private readonly logger = new Logger(ControllerAuthGuard.name);
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Checking for auth token on request body`, request.body);

    const { accessToken } = request.body;
    try {
      const playload = this.jwtService.verify(accessToken);
      request.userID = playload.sub;
      request.pollID = playload.pollID;
      request.name = playload.name;
      return true;
    } catch {
      throw new ForbiddenException('Invalid auth token');
    }
  }
}
