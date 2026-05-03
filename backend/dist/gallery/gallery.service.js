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
exports.GalleryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cloudinary = require("cloudinary");
const config_1 = require("@nestjs/config");
const gallery_entity_1 = require("./entities/gallery.entity");
let GalleryService = class GalleryService {
    constructor(repo, configService) {
        this.repo = repo;
        this.configService = configService;
        cloudinary.v2.config({
            cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async findAll(destinationId, page = 1, limit = 30) {
        const safeLimit = Math.min(Math.max(limit, 1), 60);
        const safePage = Math.max(page, 1);
        const qb = this.repo.createQueryBuilder('img').leftJoinAndSelect('img.destination', 'dest');
        if (destinationId)
            qb.andWhere('img.destinationId = :destinationId', { destinationId });
        qb.orderBy('img.createdAt', 'DESC');
        qb.skip((safePage - 1) * safeLimit).take(safeLimit + 1);
        const rows = await qb.getMany();
        const hasMore = rows.length > safeLimit;
        const data = hasMore ? rows.slice(0, safeLimit) : rows;
        return { data, page: safePage, limit: safeLimit, hasMore };
    }
    async uploadImage(file, dto) {
        const result = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream({ folder: 'starlings', resource_type: 'image' }, (error, result) => { error ? reject(error) : resolve(result); }).end(file.buffer);
        });
        const image = this.repo.create({
            destinationId: dto.destinationId,
            cloudinaryPublicId: result.public_id,
            url: result.secure_url,
            altText: dto.altText,
            width: result.width,
            height: result.height,
            isFeatured: dto.isFeatured || false,
        });
        return this.repo.save(image);
    }
    async remove(id) {
        const image = await this.repo.findOne({ where: { id } });
        if (!image)
            throw new common_1.NotFoundException('Image not found');
        await cloudinary.v2.uploader.destroy(image.cloudinaryPublicId);
        await this.repo.delete(id);
        return { message: 'Image deleted' };
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gallery_entity_1.GalleryImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], GalleryService);
//# sourceMappingURL=gallery.service.js.map