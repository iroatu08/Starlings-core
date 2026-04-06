import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: User): Promise<{
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
    updateMe(user: User, dto: UpdateUserDto): Promise<{
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
