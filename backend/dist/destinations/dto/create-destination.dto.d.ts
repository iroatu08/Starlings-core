import { CreatePackageDto } from '../../packages/dto/create-package.dto';
export declare class CreateDestinationDto {
    name: string;
    country: string;
    description: string;
    heroImageUrl?: string;
    priceFromNgn: number;
    priceFromUsd: number;
    isFeatured?: boolean;
    latitude?: number;
    longitude?: number;
    packages: CreatePackageDto[];
}
