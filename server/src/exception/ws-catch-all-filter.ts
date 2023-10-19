import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { SocketWithAuth } from 'src/polls/types';
import { WsBadRequestException, WsUnknownException } from './ws-exception';

@Catch()
export class WsCatchAllFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const socket: SocketWithAuth = host.switchToWs().getClient();

    if (exception instanceof BadRequestException) {
      const exceptionData = exception.getResponse();

      const exceptionMessage =
        exceptionData['message'] ?? exceptionData ?? exception.name;
      const WsException = new WsBadRequestException(exceptionMessage);
      socket.emit('exception', WsException.getError());
      return;
    }
    const wsException = new WsUnknownException(exception.message);
    socket.emit('exception', wsException.getError());
  }
}
