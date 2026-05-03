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
exports.Destination = void 0;
const typeorm_1 = require("typeorm");
const package_entity_1 = require("../../packages/entities/package.entity");
const gallery_entity_1 = require("../../gallery/entities/gallery.entity");
let Destination = class Destination {
};
exports.Destination = Destination;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Destination.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Destination.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Destination.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Destination.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hero_image_url', nullable: true }),
    __metadata("design:type", String)
], Destination.prototype, "heroImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_from_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Destination.prototype, "priceFromNgn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_from_usd', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Destination.prototype, "priceFromUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], Destination.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Destination.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision', nullable: true }),
    __metadata("design:type", Number)
], Destination.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision', nullable: true }),
    __metadata("design:type", Number)
], Destination.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => package_entity_1.Package, (pkg) => pkg.destination),
    __metadata("design:type", Array)
], Destination.prototype, "packages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => gallery_entity_1.GalleryImage, (img) => img.destination),
    __metadata("design:type", Array)
], Destination.prototype, "galleryImages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Destination.prototype, "createdAt", void 0);
exports.Destination = Destination = __decorate([
    (0, typeorm_1.Entity)('destinations')
], Destination);
//# sourceMappingURL=destination.entity.js.map