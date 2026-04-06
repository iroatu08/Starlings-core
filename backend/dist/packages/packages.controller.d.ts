import { PackagesService } from './packages.service';
export declare class PackagesController {
    private readonly packagesService;
    constructor(packagesService: PackagesService);
    findAll(destinationId?: string): Promise<import("./entities/package.entity").Package[]>;
    findOne(id: string): Promise<import("./entities/package.entity").Package>;
}
