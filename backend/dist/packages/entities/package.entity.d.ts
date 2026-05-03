import { Destination } from '../../destinations/entities/destination.entity';
export declare enum PackageType {
    VISA_PROCESSING = "visa_processing",
    HOTEL_RESERVATION = "hotel_reservation",
    FREE_TAXI = "free_taxi",
    AIRPORT_TRANSFER = "airport_transfer",
    CUSTOM = "custom"
}
export declare class Package {
    id: string;
    destinationId: string;
    destination: Destination;
    title: string;
    packageType: PackageType;
    description: string;
    isRemovable: boolean;
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
