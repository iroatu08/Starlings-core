import { Destination } from '../../destinations/entities/destination.entity';
export declare class Package {
    id: string;
    destinationId: string;
    destination: Destination;
    title: string;
    description: string;
    includesVisa: boolean;
    includesFlight: boolean;
    includesHotel: boolean;
    includesActivities: boolean;
    priceNgn: number;
    priceUsd: number;
    durationDays: number;
    maxCapacity: number;
    createdAt: Date;
    updatedAt: Date;
}
