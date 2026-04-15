import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TypedConfigService } from 'src/config/typed-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenPayload } from '../types/token-payload';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: TokenPayload) {
    const authToken = req.headers['authorization'];
    const refreshToken = authToken?.replace('Bearer ', '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException('Please provide valid refresh token!');
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    const validRefreshId = payload.refreshId === user?.refreshId;
    if (!validRefreshId) {
      throw new UnauthorizedException('Please provide valid refresh token!');
    }
    return user;
  }
}
