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
exports.BookingItem = void 0;
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("./booking.entity");
const package_entity_1 = require("../../packages/entities/package.entity");
const destination_entity_1 = require("../../destinations/entities/destination.entity");
let BookingItem = class BookingItem {
};
exports.BookingItem = BookingItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BookingItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id' }),
    __metadata("design:type", String)
], BookingItem.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, (booking) => booking.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], BookingItem.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'package_id', nullable: true }),
    __metadata("design:type", String)
], BookingItem.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => package_entity_1.Package, { eager: true, onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", package_entity_1.Package)
], BookingItem.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_id', nullable: true }),
    __metadata("design:type", String)
], BookingItem.prototype, "destinationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => destination_entity_1.Destination, { eager: true, onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'destination_id' }),
    __metadata("design:type", destination_entity_1.Destination)
], BookingItem.prototype, "destination", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], BookingItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price_ngn', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], BookingItem.prototype, "unitPriceNgn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bundle_snapshot', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BookingItem.prototype, "bundleSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_total_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BookingItem.prototype, "originalTotalNgn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customized_total_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BookingItem.prototype, "customizedTotalNgn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'savings_ngn', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BookingItem.prototype, "savingsNgn", void 0);
exports.BookingItem = BookingItem = __decorate([
    (0, typeorm_1.Entity)('booking_items')
], BookingItem);
//# sourceMappingURL=booking-item.entity.js.map