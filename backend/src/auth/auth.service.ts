import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { toPublicUser } from '../common/utils/sanitize-user.util';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = uuidv4();
    const { password: _pw, ...rest } = dto;

    const user = this.userRepo.create({
      ...rest,
      passwordHash,
      verificationToken,
    });
    await this.userRepo.save(user);

    await this.mailService.sendVerificationEmail(user, verificationToken);
    await this.mailService.sendWelcome(user);

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async login(dto: LoginDto, res: any) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) throw new UnauthorizedException('Please verify your email first');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user, tokens.refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: tokens.accessToken,
      user: toPublicUser(user),
    };
  }

  async refresh(user: User, res: any) {
    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user, tokens.refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  async logout(user: User, res: any) {
    await this.userRepo.update(user.id, { refreshTokenHash: null });
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({ where: { verificationToken: token } });
    if (!user) throw new NotFoundException('Invalid or expired verification token');

    await this.userRepo.update(user.id, {
      isVerified: true,
      verificationToken: null,
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    // Always return success to avoid user enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepo.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    await this.mailService.sendPasswordReset(user, token);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) throw new UnauthorizedException('Current password is incorrect');
    await this.userRepo.update(userId, { passwordHash: await bcrypt.hash(newPassword, 12) });
    return { message: 'Password updated successfully.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { resetPasswordToken: token } });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password reset successfully. You can now log in.' };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(user: User, token: string) {
    const hash = await bcrypt.hash(token, 10);
    await this.userRepo.update(user.id, { refreshTokenHash: hash });
  }

}
