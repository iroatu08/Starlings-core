import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destination } from './entities/destination.entity';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

@Injectable()
export class DestinationsService {
  constructor(@InjectRepository(Destination) private repo: Repository<Destination>) {}

  findAll(filters: { country?: string; featured?: boolean } = {}) {
    const qb = this.repo.createQueryBuilder('dest').leftJoinAndSelect('dest.packages', 'packages');
    if (filters.country) qb.andWhere('dest.country = :country', { country: filters.country });
    if (filters.featured !== undefined) qb.andWhere('dest.isFeatured = :featured', { featured: filters.featured });
    return qb.orderBy('dest.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const dest = await this.repo.findOne({
      where: { id },
      relations: ['packages', 'galleryImages'],
    });
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  async create(dto: CreateDestinationDto) {
    const dest = this.repo.create(dto);
    return this.repo.save(dest);
  }

  async update(id: string, dto: UpdateDestinationDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Destination deleted' };
  }
}
