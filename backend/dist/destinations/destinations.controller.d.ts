import { DestinationsService } from './destinations.service';
export declare class DestinationsController {
    private readonly destinationsService;
    constructor(destinationsService: DestinationsService);
    findAll(country?: string, featured?: string): Promise<import("./entities/destination.entity").Destination[]>;
    findOne(id: string): Promise<import("./entities/destination.entity").Destination>;
}
