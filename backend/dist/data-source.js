"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./users/entities/user.entity");
const destination_entity_1 = require("./destinations/entities/destination.entity");
const package_entity_1 = require("./packages/entities/package.entity");
const cart_entity_1 = require("./cart/entities/cart.entity");
const cart_item_entity_1 = require("./cart/entities/cart-item.entity");
const booking_entity_1 = require("./bookings/entities/booking.entity");
const booking_item_entity_1 = require("./bookings/entities/booking-item.entity");
const booking_traveler_entity_1 = require("./bookings/entities/booking-traveler.entity");
const payment_entity_1 = require("./payments/entities/payment.entity");
const refund_request_entity_1 = require("./payments/entities/refund-request.entity");
const gallery_entity_1 = require("./gallery/entities/gallery.entity");
const contact_submission_entity_1 = require("./contact/entities/contact-submission.entity");
const newsletter_subscriber_entity_1 = require("./newsletter/entities/newsletter-subscriber.entity");
const destination_review_entity_1 = require("./reviews/entities/destination-review.entity");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../.env') });
const migrationExtension = __filename.endsWith('.ts') ? 'ts' : 'js';
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
        user_entity_1.User,
        destination_entity_1.Destination,
        package_entity_1.Package,
        cart_entity_1.Cart,
        cart_item_entity_1.CartItem,
        booking_entity_1.Booking,
        booking_item_entity_1.BookingItem,
        booking_traveler_entity_1.BookingTraveler,
        payment_entity_1.Payment,
        refund_request_entity_1.RefundRequest,
        gallery_entity_1.GalleryImage,
        contact_submission_entity_1.ContactSubmission,
        newsletter_subscriber_entity_1.NewsletterSubscriber,
        destination_review_entity_1.DestinationReview,
    ],
    migrations: [(0, path_1.join)(__dirname, 'database', 'migrations', `*.${migrationExtension}`)],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map