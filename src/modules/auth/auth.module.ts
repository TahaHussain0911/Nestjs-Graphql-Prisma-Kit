import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { TypedConfigService } from 'src/config/typed-config.service';
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: Number(config.get('JWT_EXPIRES_IN') ?? '900'),
          },
        };
      },
    }),
  ],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
