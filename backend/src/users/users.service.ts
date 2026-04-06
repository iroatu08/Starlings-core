import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokenHash, verificationToken, resetPasswordToken, ...safe } = user;
    return safe;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    await this.userRepo.update(userId, dto);
    return this.getMe(userId);
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const qb = this.userRepo.createQueryBuilder('user');
    if (search) {
      qb.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${search}%` },
      );
    }
    qb.orderBy('user.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [users, total] = await qb.getManyAndCount();
    return { users: users.map(u => { const { passwordHash, refreshTokenHash, ...s } = u; return s; }), total, page, limit };
  }

  async updateUserAdmin(userId: string, updates: Partial<User>) {
    await this.userRepo.update(userId, updates);
    return this.getMe(userId);
  }
}
