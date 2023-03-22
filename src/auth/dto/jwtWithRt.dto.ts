import { JwtDto } from './jwt.dto';

export type JwtWithRtDto = JwtDto & { refreshToken: string };
