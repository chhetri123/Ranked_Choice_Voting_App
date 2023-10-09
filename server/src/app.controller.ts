import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get('/')
  getHello() {
    return { msg: 'hello world' };
  }
}
