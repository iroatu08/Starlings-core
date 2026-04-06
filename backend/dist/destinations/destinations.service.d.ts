import { Repository } from 'typeorm';
import { Destination } from './entities/destination.entity';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
export declare class DestinationsService {
    private repo;
    constructor(repo: Repository<Destination>);
    findAll(filters?: {
        country?: string;
        featured?: boolean;
    }): Promise<Destination[]>;
    findOne(id: string): Promise<Destination>;
    create(dto: CreateDestinationDto): Promise<Destination>;
    update(id: string, dto: UpdateDestinationDto): Promise<Destination>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
