import { Controller, Get } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'test', description: 'test' })
  @ApiCreatedResponse({ description: '유저를 생성한다.', type: ApiOperation })
  getHello(): string {
    return this.appService.getHello();
  }
}
