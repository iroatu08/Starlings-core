import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesService {
    private repo;
    constructor(repo: Repository<Package>);
    findAll(destinationId?: string): Promise<Package[]>;
    findOne(id: string): Promise<Package>;
    create(dto: CreatePackageDto): Promise<Package>;
    update(id: string, dto: UpdatePackageDto): Promise<Package>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
