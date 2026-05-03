import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toPublicUser } from '../common/utils/sanitize-user.util';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return toPublicUser(user);
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
    return { users: users.map((u) => toPublicUser(u)), total, page, limit };
  }

  async updateUserAdmin(userId: string, updates: Partial<User>) {
    await this.userRepo.update(userId, updates);
    return this.getMe(userId);
  }

  async countUsers(): Promise<number> {
    return this.userRepo.count();
  }

  async findEmailById(id: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { id }, select: ['id', 'email'] });
    if (!user) throw new NotFoundException('User not found');
    return user.email;
  }

  async getVerifiedUserEmails(): Promise<string[]> {
    const users = await this.userRepo.find({
      where: { isVerified: true, isActive: true },
      select: ['email'],
    });
    return users.map((u) => u.email);
  }
}
