import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    getMe(userId: string): Promise<import("../common/utils/sanitize-user.util").PublicUser>;
    updateMe(userId: string, dto: UpdateUserDto): Promise<import("../common/utils/sanitize-user.util").PublicUser>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        users: import("../common/utils/sanitize-user.util").PublicUser[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateUserAdmin(userId: string, updates: Partial<User>): Promise<import("../common/utils/sanitize-user.util").PublicUser>;
    countUsers(): Promise<number>;
    findEmailById(id: string): Promise<string>;
    getVerifiedUserEmails(): Promise<string[]>;
}
