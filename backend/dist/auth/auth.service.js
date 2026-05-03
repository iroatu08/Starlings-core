"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const sanitize_user_util_1 = require("../common/utils/sanitize-user.util");
const user_entity_1 = require("../users/entities/user.entity");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    constructor(userRepo, jwtService, configService, mailService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
    }
    async register(dto) {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const verificationToken = (0, uuid_1.v4)();
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
    async login(dto, res) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isVerified)
            throw new common_1.UnauthorizedException('Please verify your email first');
        if (!user.isActive)
            throw new common_1.UnauthorizedException('Account is deactivated');
        const tokens = await this.generateTokens(user);
        await this.storeRefreshToken(user, tokens.refreshToken);
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: tokens.accessToken,
            user: (0, sanitize_user_util_1.toPublicUser)(user),
        };
    }
    async refresh(user, res) {
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
    async logout(user, res) {
        await this.userRepo.update(user.id, { refreshTokenHash: null });
        res.clearCookie('refresh_token');
        return { message: 'Logged out successfully' };
    }
    async verifyEmail(token) {
        const user = await this.userRepo.findOne({ where: { verificationToken: token } });
        if (!user)
            throw new common_1.NotFoundException('Invalid or expired verification token');
        await this.userRepo.update(user.id, {
            isVerified: true,
            verificationToken: null,
        });
        return { message: 'Email verified successfully. You can now log in.' };
    }
    async forgotPassword(email) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            return { message: 'If that email exists, a reset link has been sent.' };
        const token = (0, uuid_1.v4)();
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepo.update(user.id, {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });
        await this.mailService.sendPasswordReset(user, token);
        return { message: 'If that email exists, a reset link has been sent.' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const match = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!match)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        await this.userRepo.update(userId, { passwordHash: await bcrypt.hash(newPassword, 12) });
        return { message: 'Password updated successfully.' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepo.findOne({ where: { resetPasswordToken: token } });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired reset token');
        if (user.resetPasswordExpires < new Date()) {
            throw new common_1.BadRequestException('Reset token has expired. Please request a new one.');
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userRepo.update(user.id, {
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });
        return { message: 'Password reset successfully. You can now log in.' };
    }
    async generateTokens(user) {
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
    async storeRefreshToken(user, token) {
        const hash = await bcrypt.hash(token, 10);
        await this.userRepo.update(user.id, { refreshTokenHash: hash });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map