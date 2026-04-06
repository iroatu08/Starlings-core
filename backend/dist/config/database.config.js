"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const user_entity_1 = require("../users/entities/user.entity");
const destination_entity_1 = require("../destinations/entities/destination.entity");
const package_entity_1 = require("../packages/entities/package.entity");
const cart_entity_1 = require("../cart/entities/cart.entity");
const cart_item_entity_1 = require("../cart/entities/cart-item.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const booking_item_entity_1 = require("../bookings/entities/booking-item.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const gallery_entity_1 = require("../gallery/entities/gallery.entity");
const contact_submission_entity_1 = require("../contact/entities/contact-submission.entity");
const getDatabaseConfig = (configService) => ({
    type: 'postgres',
    url: configService.get('DATABASE_URL'),
    entities: [
        user_entity_1.User,
        destination_entity_1.Destination,
        package_entity_1.Package,
        cart_entity_1.Cart,
        cart_item_entity_1.CartItem,
        booking_entity_1.Booking,
        booking_item_entity_1.BookingItem,
        payment_entity_1.Payment,
        gallery_entity_1.GalleryImage,
        contact_submission_entity_1.ContactSubmission,
    ],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
});
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map