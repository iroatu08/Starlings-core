"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const users_module_1 = require("../users/users.module");
const bookings_module_1 = require("../bookings/bookings.module");
const payments_module_1 = require("../payments/payments.module");
const destinations_module_1 = require("../destinations/destinations.module");
const packages_module_1 = require("../packages/packages.module");
const gallery_module_1 = require("../gallery/gallery.module");
const contact_module_1 = require("../contact/contact.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            destinations_module_1.DestinationsModule,
            packages_module_1.PackagesModule,
            gallery_module_1.GalleryModule,
            contact_module_1.ContactModule,
        ],
        controllers: [admin_controller_1.AdminController],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map