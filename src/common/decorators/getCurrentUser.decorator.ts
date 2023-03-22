import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { JwtWithRtDto } from 'src/auth/dto/jwtWithRt.dto';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtWithRtDto, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    Logger.log('data 받았는지 체크');
    Logger.log(data);
    Logger.log(user);

    return user[data];
  },
);
