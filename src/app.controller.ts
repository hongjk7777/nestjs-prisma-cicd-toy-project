import { Controller, Get } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'test', description: 'test' })
  @ApiCreatedResponse({ description: '유저를 생성한다.', type: ApiOperation })
  getHello(): string {
    return this.appService.getHello();
  }
}
