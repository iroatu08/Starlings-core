import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepo;
    private jwtService;
    private configService;
    private mailService;
    constructor(userRepo: Repository<User>, jwtService: JwtService, configService: ConfigService, mailService: MailService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, res: any): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            address: string;
            role: import("../users/entities/user.entity").UserRole;
            isVerified: boolean;
            isActive: boolean;
            resetPasswordExpires: Date;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    refresh(user: User, res: any): Promise<{
        accessToken: string;
    }>;
    logout(user: User, res: any): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private storeRefreshToken;
    private sanitizeUser;
}
