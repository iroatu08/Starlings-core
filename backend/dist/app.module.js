"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const Joi = require("joi");
const database_config_1 = require("./config/database.config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const destinations_module_1 = require("./destinations/destinations.module");
const packages_module_1 = require("./packages/packages.module");
const cart_module_1 = require("./cart/cart.module");
const bookings_module_1 = require("./bookings/bookings.module");
const payments_module_1 = require("./payments/payments.module");
const gallery_module_1 = require("./gallery/gallery.module");
const contact_module_1 = require("./contact/contact.module");
const admin_module_1 = require("./admin/admin.module");
const mail_module_1 = require("./mail/mail.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
                    PORT: Joi.number().default(3001),
                    FRONTEND_URL: Joi.string().required(),
                    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
                    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
                    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
                    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
                    DATABASE_URL: Joi.string().required(),
                    MAILTRAP_HOST: Joi.string().required(),
                    MAILTRAP_PORT: Joi.number().required(),
                    MAILTRAP_USER: Joi.string().required(),
                    MAILTRAP_PASS: Joi.string().required(),
                    PAYSTACK_SECRET_KEY: Joi.string().required(),
                    PAYSTACK_PUBLIC_KEY: Joi.string().required(),
                    CLOUDINARY_CLOUD_NAME: Joi.string().optional().allow(''),
                    CLOUDINARY_API_KEY: Joi.string().optional().allow(''),
                    CLOUDINARY_API_SECRET: Joi.string().optional().allow(''),
                    ADMIN_EMAIL: Joi.string().email().required(),
                }),
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: database_config_1.getDatabaseConfig,
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    name: 'global',
                    ttl: 60000,
                    limit: 100,
                }]),
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            destinations_module_1.DestinationsModule,
            packages_module_1.PackagesModule,
            cart_module_1.CartModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            gallery_module_1.GalleryModule,
            contact_module_1.ContactModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map