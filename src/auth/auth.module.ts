import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategy/at.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { RtStrategy } from './strategy/rt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AuthService, AtStrategy, LocalStrategy, RtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
