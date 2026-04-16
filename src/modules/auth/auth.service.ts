import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypedConfigService } from 'src/config/typed-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RESET_PASSWORD_OTP_EXPIRY, SALT_ROUNDS } from 'src/utils/constants';
import { randomBytes } from 'crypto';
import { TokenPayload } from './types/token-payload';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { ForgotPasswordInput } from './dto/forgot-password-input';
import { User } from '@prisma/client';
import { generateOtp, getTimeDifference } from 'src/utils/helper';
import { VerifyOtpInput } from './dto/verify-otp-input';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordInput } from './dto/reset-password-input';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: TypedConfigService,
    private readonly mailService: MailService,
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

  async forgotPassword(forgotPasswordInput: ForgotPasswordInput) {
    const user = await this.findByEmail(forgotPasswordInput.email);
    await this.validateAndSendOtp(user);
    return { message: 'OTP sent to your email.' };
  }

  async resendOtp(forgotPasswordInput: ForgotPasswordInput) {
    const user = await this.findByEmail(forgotPasswordInput.email);
    if (!user.otpExpiresAt) {
      throw new BadRequestException(
        `First request for otp using /forgot-password route`,
      );
    }
    await this.validateAndSendOtp(user);
    return { message: 'OTP resent to your email.' };
  }

  async verifyOtp(verifyOtpInput: VerifyOtpInput) {
    const { email, otp } = verifyOtpInput;
    const user = await this.findByEmail(email);
    if (user.otpVerified) {
      throw new HttpException(
        {
          message: `Your otp is verified. You can change your password`,
        },
        HttpStatus.OK,
      );
    }
    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestException('Please request for otp');
    }
    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }
    const isOtpMatching = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatching) {
      throw new BadRequestException('Invalid OTP');
    }
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        otpVerified: true,
      },
    });
    return { message: 'OTP verified successfully.' };
  }

  async resetPassword(resetPasswordInput: ResetPasswordInput) {
    const { email, newPassword } = resetPasswordInput;
    const user = await this.findByEmail(email);
    if (!user.otpVerified) {
      throw new BadRequestException(
        `OTP not verified. Please verify your OTP first.`,
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        otpVerified: false,
        otpExpiresAt: null,
        otp: null,
      },
    });
    return { message: 'Password reset successfully.' };
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
    return {
      message: 'Logged out successfully!',
    };
  }

  private async validateAndSendOtp(user: User) {
    if (user.otpVerified) {
      throw new HttpException(
        {
          message: 'Your otp is verified. You can change your password',
        },
        HttpStatus.OK,
      );
    }
    if (
      user.otpExpiresAt &&
      !user.otpVerified &&
      new Date() < user.otpExpiresAt
    ) {
      const timeDiff = getTimeDifference(new Date(user.otpExpiresAt).getTime());
      throw new BadRequestException(
        `Please wait ${timeDiff.minutes}m ${timeDiff.seconds}s before requesting a new OTP`,
      );
    }
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + RESET_PASSWORD_OTP_EXPIRY);

    const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        otp: hashedOtp,
        otpExpiresAt: otpExpires,
        otpVerified: false,
      },
    });
    await this.mailService.sendPasswordResetOtpEmail({
      email: user.email,
      otp,
    });
  }

  private async updateRefreshId(userId: string, refreshId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshId,
      },
    });
  }

  private async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  private async generateTokens(userId: string, email: string) {
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
