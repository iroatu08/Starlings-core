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
exports.DestinationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const destinations_service_1 = require("./destinations.service");
let DestinationsController = class DestinationsController {
    constructor(destinationsService) {
        this.destinationsService = destinationsService;
    }
    findAll(country, featured, minPriceNgn, maxPriceNgn) {
        return this.destinationsService.findAll({
            country,
            featured: featured ? featured === 'true' : undefined,
            minPriceNgn: minPriceNgn ? Number(minPriceNgn) : undefined,
            maxPriceNgn: maxPriceNgn ? Number(maxPriceNgn) : undefined,
        });
    }
    findOne(id) {
        return this.destinationsService.findOne(id);
    }
};
exports.DestinationsController = DestinationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'featured', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'minPriceNgn', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'maxPriceNgn', required: false, type: Number }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('featured')),
    __param(2, (0, common_1.Query)('minPriceNgn')),
    __param(3, (0, common_1.Query)('maxPriceNgn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], DestinationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DestinationsController.prototype, "findOne", null);
exports.DestinationsController = DestinationsController = __decorate([
    (0, swagger_1.ApiTags)('destinations'),
    (0, common_1.Controller)('destinations'),
    __metadata("design:paramtypes", [destinations_service_1.DestinationsService])
], DestinationsController);
//# sourceMappingURL=destinations.controller.js.map