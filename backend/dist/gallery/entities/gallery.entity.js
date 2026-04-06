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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryImage = void 0;
const typeorm_1 = require("typeorm");
const destination_entity_1 = require("../../destinations/entities/destination.entity");
let GalleryImage = class GalleryImage {
};
exports.GalleryImage = GalleryImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GalleryImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_id', nullable: true }),
    __metadata("design:type", String)
], GalleryImage.prototype, "destinationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => destination_entity_1.Destination, (dest) => dest.galleryImages, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'destination_id' }),
    __metadata("design:type", destination_entity_1.Destination)
], GalleryImage.prototype, "destination", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cloudinary_public_id' }),
    __metadata("design:type", String)
], GalleryImage.prototype, "cloudinaryPublicId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GalleryImage.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alt_text', nullable: true }),
    __metadata("design:type", String)
], GalleryImage.prototype, "altText", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GalleryImage.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GalleryImage.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], GalleryImage.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GalleryImage.prototype, "createdAt", void 0);
exports.GalleryImage = GalleryImage = __decorate([
    (0, typeorm_1.Entity)('gallery')
], GalleryImage);
//# sourceMappingURL=gallery.entity.js.map