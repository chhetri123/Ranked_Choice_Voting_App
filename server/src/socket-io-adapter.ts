import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { Server, ServerOptions } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SocketWithAuth } from './polls/types';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(this.configService.get('CLIENT_PORT'));

    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
        `/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`,
      ],
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };
    const jwtService = this.app.get(JwtService);

    // we need to return this, even though the signature says it returns void
    const server: Server = super.createIOServer(port, optionsWithCORS);
    server.of('polls').use(createTokenMiddleware(jwtService, this.logger));
    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, Logger: Logger) =>
  (socket: SocketWithAuth, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];
    Logger.debug(`Validating auth token before connection :${token}`);
    try {
      const playlaod = jwtService.verify(token);
      socket.userID = playlaod.sub;
      socket.pollID = playlaod.pollID;
      socket.name = playlaod.name;
      next();
    } catch {
      next(new Error('Forbidden. Invalid auth token'));
    }
  };
