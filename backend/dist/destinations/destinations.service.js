"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const destination_entity_1 = require("./entities/destination.entity");
let DestinationsService = class DestinationsService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll(filters = {}) {
        const qb = this.repo.createQueryBuilder('dest').leftJoinAndSelect('dest.packages', 'packages');
        if (filters.country)
            qb.andWhere('dest.country = :country', { country: filters.country });
        if (filters.featured !== undefined)
            qb.andWhere('dest.isFeatured = :featured', { featured: filters.featured });
        return qb.orderBy('dest.createdAt', 'DESC').getMany();
    }
    async findOne(id) {
        const dest = await this.repo.findOne({
            where: { id },
            relations: ['packages', 'galleryImages'],
        });
        if (!dest)
            throw new common_1.NotFoundException('Destination not found');
        return dest;
    }
    async create(dto) {
        const dest = this.repo.create(dto);
        return this.repo.save(dest);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
        return { message: 'Destination deleted' };
    }
};
exports.DestinationsService = DestinationsService;
exports.DestinationsService = DestinationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(destination_entity_1.Destination)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DestinationsService);
//# sourceMappingURL=destinations.service.js.map