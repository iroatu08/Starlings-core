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
exports.PackagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const package_entity_1 = require("./entities/package.entity");
let PackagesService = class PackagesService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll(destinationId) {
        const qb = this.repo.createQueryBuilder('pkg').leftJoinAndSelect('pkg.destination', 'dest');
        if (destinationId)
            qb.where('pkg.destinationId = :destinationId', { destinationId });
        return qb.orderBy('pkg.priceNgn', 'ASC').getMany();
    }
    async findOne(id) {
        const pkg = await this.repo.findOne({ where: { id }, relations: ['destination'] });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        return pkg;
    }
    async create(dto) {
        const pkg = this.repo.create(dto);
        return this.repo.save(pkg);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
        return { message: 'Package deleted' };
    }
};
exports.PackagesService = PackagesService;
exports.PackagesService = PackagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(package_entity_1.Package)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PackagesService);
//# sourceMappingURL=packages.service.js.map