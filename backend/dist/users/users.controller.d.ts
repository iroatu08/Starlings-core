import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: User): Promise<import("../common/utils/sanitize-user.util").PublicUser>;
    updateMe(user: User, dto: UpdateUserDto): Promise<import("../common/utils/sanitize-user.util").PublicUser>;
}
