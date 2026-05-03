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
exports.Package = exports.PackageType = void 0;
const typeorm_1 = require("typeorm");
const destination_entity_1 = require("../../destinations/entities/destination.entity");
var PackageType;
(function (PackageType) {
    PackageType["VISA_PROCESSING"] = "visa_processing";
    PackageType["HOTEL_RESERVATION"] = "hotel_reservation";
    PackageType["FREE_TAXI"] = "free_taxi";
    PackageType["AIRPORT_TRANSFER"] = "airport_transfer";
    PackageType["CUSTOM"] = "custom";
})(PackageType || (exports.PackageType = PackageType = {}));
let Package = class Package {
};
exports.Package = Package;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Package.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_id' }),
    __metadata("design:type", String)
], Package.prototype, "destinationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => destination_entity_1.Destination, (dest) => dest.packages, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'destination_id' }),
    __metadata("design:type", destination_entity_1.Destination)
], Package.prototype, "destination", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Package.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'package_type',
        type: 'enum',
        enum: PackageType,
        default: PackageType.CUSTOM,
    }),
    __metadata("design:type", String)
], Package.prototype, "packageType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Package.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_removable', default: true }),
    __metadata("design:type", Boolean)
], Package.prototype, "isRemovable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'includes_visa', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "includesVisa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'includes_flight', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "includesFlight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'includes_hotel', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "includesHotel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'includes_activities', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "includesActivities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_ngn', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Package.prototype, "priceNgn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_usd', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Package.prototype, "priceUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_days', default: 1 }),
    __metadata("design:type", Number)
], Package.prototype, "durationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_capacity', default: 20 }),
    __metadata("design:type", Number)
], Package.prototype, "maxCapacity", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Package.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Package.prototype, "updatedAt", void 0);
exports.Package = Package = __decorate([
    (0, typeorm_1.Entity)('packages')
], Package);
//# sourceMappingURL=package.entity.js.map