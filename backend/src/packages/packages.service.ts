import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(@InjectRepository(Package) private repo: Repository<Package>) {}

  findAll(destinationId?: string) {
    const qb = this.repo.createQueryBuilder('pkg').leftJoinAndSelect('pkg.destination', 'dest');
    if (destinationId) qb.where('pkg.destinationId = :destinationId', { destinationId });
    return qb.orderBy('pkg.priceNgn', 'ASC').getMany();
  }

  async findOne(id: string) {
    const pkg = await this.repo.findOne({ where: { id }, relations: ['destination'] });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async create(dto: CreatePackageDto) {
    const pkg = this.repo.create(dto);
    return this.repo.save(pkg);
  }

  async update(id: string, dto: UpdatePackageDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Package deleted' };
  }
}
