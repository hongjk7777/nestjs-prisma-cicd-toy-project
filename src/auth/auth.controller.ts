import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUserId } from 'src/common/decorators/getCurrentUserId.decorator';
import { GetCurrentUser } from 'src/common/decorators/getCurrentUser.decorator';
import { Token } from 'src/model/token.model';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from '../common/guard/localAuth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { RtAuthGuard } from 'src/common/guard/rtAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() userData: SignupDto): Promise<Token> {
    return await this.authService.signup(userData);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<void> {
    return req.user;

    // return await this.authService.login(userData);
  }

  @Get('test')
  test() {
    return 'test';
  }

  @Public()
  @UseGuards(RtAuthGuard)
  @Post('refresh')
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
