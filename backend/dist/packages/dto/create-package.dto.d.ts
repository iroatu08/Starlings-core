export declare class CreatePackageDto {
    destinationId: string;
    title: string;
    description?: string;
    includesVisa?: boolean;
    includesFlight?: boolean;
    includesHotel?: boolean;
    includesActivities?: boolean;
    priceNgn: number;
    priceUsd: number;
    durationDays: number;
    maxCapacity?: number;
}
