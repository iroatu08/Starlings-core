import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        role: import("./entities/user.entity").UserRole;
        isVerified: boolean;
        isActive: boolean;
        resetPasswordExpires: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMe(userId: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        role: import("./entities/user.entity").UserRole;
        isVerified: boolean;
        isActive: boolean;
        resetPasswordExpires: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        users: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            address: string;
            role: import("./entities/user.entity").UserRole;
            isVerified: boolean;
            isActive: boolean;
            verificationToken: string;
            resetPasswordToken: string;
            resetPasswordExpires: Date;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateUserAdmin(userId: string, updates: Partial<User>): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        role: import("./entities/user.entity").UserRole;
        isVerified: boolean;
        isActive: boolean;
        resetPasswordExpires: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
