import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response';
import { LogoutResponse } from './dto/log-out-response';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { TokenResponse } from './dto/token-response';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  register(@Args('input') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  login(@Args('input') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @UseGuards(RefreshTokenGuard)
  @Mutation(() => TokenResponse)
  refreshTokens(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
  ) {
    return this.authService.refreshTokens(userId, email);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => LogoutResponse)
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Query(() => String)
  hello() {
    return 'Hello world';
  }
}
