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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const users_service_1 = require("../users/users.service");
const bookings_service_1 = require("../bookings/bookings.service");
const payments_service_1 = require("../payments/payments.service");
const destinations_service_1 = require("../destinations/destinations.service");
const packages_service_1 = require("../packages/packages.service");
const gallery_service_1 = require("../gallery/gallery.service");
const contact_service_1 = require("../contact/contact.service");
const create_destination_dto_1 = require("../destinations/dto/create-destination.dto");
const update_destination_dto_1 = require("../destinations/dto/update-destination.dto");
const create_package_dto_1 = require("../packages/dto/create-package.dto");
const update_package_dto_1 = require("../packages/dto/update-package.dto");
const upload_image_dto_1 = require("../gallery/dto/upload-image.dto");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const user_entity_2 = require("../users/entities/user.entity");
let AdminController = class AdminController {
    constructor(usersService, bookingsService, paymentsService, destinationsService, packagesService, galleryService, contactService) {
        this.usersService = usersService;
        this.bookingsService = bookingsService;
        this.paymentsService = paymentsService;
        this.destinationsService = destinationsService;
        this.packagesService = packagesService;
        this.galleryService = galleryService;
        this.contactService = contactService;
    }
    getUsers(page, limit, search) {
        return this.usersService.findAll(page, limit, search);
    }
    updateUser(id, body) {
        return this.usersService.updateUserAdmin(id, body);
    }
    getBookings(page, limit, status) {
        return this.bookingsService.findAll(page, limit, status);
    }
    updateBookingStatus(id, status, user) {
        return this.bookingsService.updateStatus(id, status, user);
    }
    getPayments(page, limit) {
        return this.paymentsService.getAllPayments(page, limit);
    }
    createDestination(dto) {
        return this.destinationsService.create(dto);
    }
    updateDestination(id, dto) {
        return this.destinationsService.update(id, dto);
    }
    deleteDestination(id) {
        return this.destinationsService.remove(id);
    }
    createPackage(dto) {
        return this.packagesService.create(dto);
    }
    updatePackage(id, dto) {
        return this.packagesService.update(id, dto);
    }
    deletePackage(id) {
        return this.packagesService.remove(id);
    }
    uploadImage(file, dto) {
        return this.galleryService.uploadImage(file, dto);
    }
    deleteImage(id) {
        return this.galleryService.remove(id);
    }
    getContactSubmissions(page, limit) {
        return this.contactService.findAll(page, limit);
    }
    markContactRead(id) {
        return this.contactService.markRead(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_2.User]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBookingStatus", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('destinations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_destination_dto_1.CreateDestinationDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createDestination", null);
__decorate([
    (0, common_1.Patch)('destinations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_destination_dto_1.UpdateDestinationDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateDestination", null);
__decorate([
    (0, common_1.Delete)('destinations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteDestination", null);
__decorate([
    (0, common_1.Post)('packages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_package_dto_1.CreatePackageDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Patch)('packages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_package_dto_1.UpdatePackageDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Delete)('packages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deletePackage", null);
__decorate([
    (0, common_1.Post)('gallery/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_image_dto_1.UploadImageDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Delete)('gallery/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Get)('contact'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getContactSubmissions", null);
__decorate([
    (0, common_1.Patch)('contact/:id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "markContactRead", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        bookings_service_1.BookingsService,
        payments_service_1.PaymentsService,
        destinations_service_1.DestinationsService,
        packages_service_1.PackagesService,
        gallery_service_1.GalleryService,
        contact_service_1.ContactService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map