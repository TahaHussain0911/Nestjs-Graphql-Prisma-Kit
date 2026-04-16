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
import { ForgotPasswordInput } from './dto/forgot-password-input';
import { VerifyOtpInput } from './dto/verify-otp-input';
import { ResetPasswordInput } from './dto/reset-password-input';
import { MessageResponse } from './dto/message-response';
import { IsPublic } from 'src/common/decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Mutation(() => AuthResponse)
  register(@Args('input') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @IsPublic()
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

  @IsPublic()
  @Mutation(() => MessageResponse)
  forgotPassword(@Args('input') forgotPasswordInput: ForgotPasswordInput) {
    return this.authService.forgotPassword(forgotPasswordInput);
  }

  @IsPublic()
  @Mutation(() => MessageResponse)
  resendOtp(@Args('input') forgotPasswordInput: ForgotPasswordInput) {
    return this.authService.resendOtp(forgotPasswordInput);
  }

  @IsPublic()
  @Mutation(() => MessageResponse)
  verifyOtp(@Args('input') verifyOtpInput: VerifyOtpInput) {
    return this.authService.verifyOtp(verifyOtpInput);
  }

  @IsPublic()
  @Mutation(() => MessageResponse)
  resetPassword(@Args('input') resetPasswordInput: ResetPasswordInput) {
    return this.authService.resetPassword(resetPasswordInput);
  }

  @IsPublic()
  @Query(() => String)
  hello() {
    return 'Hello world';
  }
}
