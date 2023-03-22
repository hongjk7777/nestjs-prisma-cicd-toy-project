import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtDto } from 'src/auth/dto/jwt.dto';

export const GetCurrentUserId = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtDto;

    return user.userId;
  },
);
