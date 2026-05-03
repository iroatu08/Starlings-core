import { PackageType } from '../entities/package.entity';
export declare class CreatePackageDto {
    destinationId?: string;
    name: string;
    type: PackageType;
    description?: string;
    isRemovable?: boolean;
    includesVisa?: boolean;
    includesFlight?: boolean;
    includesHotel?: boolean;
    includesActivities?: boolean;
    priceNgn: number;
    priceUsd: number;
    durationDays?: number;
    maxCapacity?: number;
}
