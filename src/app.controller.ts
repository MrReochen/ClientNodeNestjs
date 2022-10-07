import { Controller, Get, Post, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('bonjour')
  getbonjour(@Request() req) {
    // console.log(req)
    return this.appService.bonjour(req.body.server);
  }

  @Post('api/work')
  postWork(@Request() req) {
    return this.appService.work(req.body)
  }

  @Post('api/bonjour')
  async postbonjour(@Request() req) {
    return this.appService.bonjour(req.body.server);
  }
}
