import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypedConfigService } from 'src/config/typed-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/utils/constants';
import { randomBytes } from 'crypto';
import { TokenPayload } from './types/token-payload';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: TypedConfigService,
  ) {}

  async register(registerInput: RegisterInput) {
    const { name, email, password } = registerInput;
    const emailTaken = await this.prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      throw new ConflictException('Email taken!');
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshId(user.id, tokens.refreshId);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async login(loginInput: LoginInput) {
    const { email, password } = loginInput;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid Credentials!');
    }
    const hashedPassword = await bcrypt.compare(password, user.password);
    if (!hashedPassword) {
      throw new BadRequestException('Invalid Credentials!');
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshId(user.id, tokens.refreshId);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async refreshTokens(userId: string, email: string) {
    const tokens = await this.generateTokens(userId, email);
    await this.updateRefreshId(userId, tokens.refreshId);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async updateRefreshId(userId: string, refreshId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshId,
      },
    });
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshId: null,
      },
    });
  }

  async generateTokens(userId: string, email: string) {
    const payload: TokenPayload = {
      sub: userId,
      email,
    };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '3d',
      }),
      this.jwtService.sign(
        { ...payload, refreshId },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
      refreshId,
    };
  }
}
