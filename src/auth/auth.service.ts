import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { SecurityConfig } from 'src/common/config/config.interface';
import { Token } from 'src/model/token.model';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  validateUser(userId: number): Promise<User> {
    const id = parseInt(userId.toString());
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  async signup(userData: SignupDto): Promise<Token> {
    const hashedPassword = await this.hashPassword(userData.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      return await this.generateTokens({ userId: user.id.toString() });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email already used`);
      }

      throw new Error(e);
    }
  }

  async hashPassword(password: string): Promise<string> {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const saltOrRounds = securityConfig.bcryptSaltOrRound;

    return await hash(password, saltOrRounds);
  }

  async login(userData: LoginDto): Promise<Token> {
    const user: User = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    const loginSuccess = compare(userData.password, user.password);

    if (!loginSuccess) {
      throw new BadRequestException('Invalid password');
    }

    return await this.generateTokens({ userId: user.id.toString() });
  }

  generateCookieWithToken(token: Token): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${securityConfig.expiresIn}`;
  }

  async generateTokens(payload: { userId: string }): Promise<Token> {
    const tokens: Token = {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };

    await this.updateTokens(payload, tokens);

    return tokens;
  }

  private async updateTokens(payload: { userId: string }, tokens: Token) {
    await this.prisma.user.update({
      where: {
        id: parseInt(payload.userId),
      },
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
    });
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId.toString()) },
    });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    console.log(user.refresh_token);
    console.log(refreshToken);

    if (user.refresh_token !== refreshToken) {
      await this.expireTokens(user.id);
      throw new ForbiddenException('Invalid Refresh Token');
    }

    return await this.generateTokens({ userId: user.id.toString() });
  }

  async expireTokens(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        access_token: '',
        refresh_token: '',
      },
    });
  }
}
