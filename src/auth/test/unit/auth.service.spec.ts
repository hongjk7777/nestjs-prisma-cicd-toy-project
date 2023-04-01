import { BadRequestException, ForbiddenException } from '@nestjs/common';
import _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { Token } from 'src/model/token.model';
import { SignupDto } from 'src/auth/dto/signup.dto';

const user: User = {
  id: 1,
  email: 'hello@prisma.io',
  password: 'secret-password',
  access_token: 'testToken',
  refresh_token: 'testToken',
};

describe('AuthService test', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await prisma.$disconnect();
    await moduleRef.close();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@test.com',
      password: 'secret',
      firstName: '',
      lastName: '',
    };

    it('should signup with generated Jwts', async () => {
      prisma.user.create = jest.fn().mockResolvedValue(user);

      const tokens = await authService.signup(signupDto);

      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
    });

    it('should throw error', async () => {
      prisma.user.create = jest.fn().mockRejectedValue(new Error());

      await expect(authService.signup(signupDto)).rejects.toThrowError(
        new Error('Error'),
      );
    });
  });

  describe('login', () => {
    it('should login with generated Jwts', async () => {
      const savedUser = _.clone(user);
      savedUser.password = await hash(user.password, 1);

      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: user.password,
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(savedUser);

      const tokens: Token = await authService.login(loginDto);

      // expect(mock).toBeCalledTimes(1);
      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
    });

    it('should throw invalid password error', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'wrong-password',
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(user);

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new BadRequestException('Invalid password'),
      );
    });
  });

  describe('generateTokens', () => {
    it('should generateTokens', async () => {
      const tokens = await authService.generateTokens({ userId: '1' });

      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
    });
  });

  describe('refreshTokens', () => {
    it('should forbidden error if invalid refresh token', async () => {
      await expect(
        authService.refreshTokens(1, 'testToken'),
      ).rejects.toThrowError(new ForbiddenException('Invalid Refresh Token'));
    });

    it('should expire token if invalid refreshtoken enter', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      const spyExpire = jest.spyOn(authService, 'expireTokens');

      await expect(
        authService.refreshTokens(1, 'wrongToken'),
      ).rejects.toThrowError(new ForbiddenException('Invalid Refresh Token'));

      expect(spyExpire).toBeCalledTimes(1);
      expect(spyExpire).toBeCalledWith(1);
    });
  });
});
