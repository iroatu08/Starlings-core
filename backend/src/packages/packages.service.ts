import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(@InjectRepository(Package) private repo: Repository<Package>) {}

  // find all packages
  findAll(destinationId?: string) {
    const qb = this.repo.createQueryBuilder('pkg').leftJoinAndSelect('pkg.destination', 'dest');
    if (destinationId) qb.where('pkg.destinationId = :destinationId', { destinationId });
    return qb.orderBy('pkg.priceNgn', 'ASC').getMany();
  }

  // find one package by id
  async findOne(id: string) {
    const pkg = await this.repo.findOne({ where: { id }, relations: ['destination'] });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  // create a package
  async create(dto: CreatePackageDto) {
    const pkg = this.repo.create({
      destinationId: dto.destinationId,
      title: dto.name,
      packageType: dto.type,
      description: dto.description,
      isRemovable: dto.isRemovable ?? true,
      includesVisa: dto.includesVisa ?? false,
      includesFlight: dto.includesFlight ?? false,
      includesHotel: dto.includesHotel ?? false,
      includesActivities: dto.includesActivities ?? false,
      priceNgn: dto.priceNgn,
      priceUsd: dto.priceUsd,
      durationDays: dto.durationDays ?? 1,
      maxCapacity: dto.maxCapacity ?? 20,
    });
    return this.repo.save(pkg);
  }

  // update a package
  async update(id: string, dto: UpdatePackageDto) {
    await this.findOne(id);
    await this.repo.update(id, {
      destinationId: dto.destinationId,
      title: dto.name,
      packageType: dto.type,
      description: dto.description,
      isRemovable: dto.isRemovable,
      includesVisa: dto.includesVisa,
      includesFlight: dto.includesFlight,
      includesHotel: dto.includesHotel,
      includesActivities: dto.includesActivities,
      priceNgn: dto.priceNgn,
      priceUsd: dto.priceUsd,
      durationDays: dto.durationDays,
      maxCapacity: dto.maxCapacity,
    });
    return this.findOne(id);
  }

  // delete a package
  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Package deleted' };
  }
}
