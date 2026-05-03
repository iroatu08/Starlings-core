import { UsersService } from '../users/users.service';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentsService } from '../payments/payments.service';
import { DestinationsService } from '../destinations/destinations.service';
import { GalleryService } from '../gallery/gallery.service';
import { ContactService } from '../contact/contact.service';
import { AdminService } from './admin.service';
import { AdminSendEmailDto } from './dto/admin-send-email.dto';
import { CreateDestinationDto } from '../destinations/dto/create-destination.dto';
import { UpdateDestinationDto } from '../destinations/dto/update-destination.dto';
import { CreatePackageDto } from '../packages/dto/create-package.dto';
import { UpdatePackageDto } from '../packages/dto/update-package.dto';
import { UploadImageDto } from '../gallery/dto/upload-image.dto';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { PaymentStatus } from '../payments/entities/payment.entity';
import { RefundRequestStatus } from '../payments/entities/refund-request.entity';
import { RejectRefundDto } from '../payments/dto/reject-refund.dto';
export declare class AdminController {
    private adminService;
    private usersService;
    private bookingsService;
    private paymentsService;
    private destinationsService;
    private galleryService;
    private contactService;
    constructor(adminService: AdminService, usersService: UsersService, bookingsService: BookingsService, paymentsService: PaymentsService, destinationsService: DestinationsService, galleryService: GalleryService, contactService: ContactService);
    getStats(): Promise<{
        totalBookings: number;
        totalUsers: number;
        revenueNgn: number;
        recentBookings: import("../bookings/entities/booking.entity").Booking[];
    }>;
    sendAdminEmail(dto: AdminSendEmailDto): Promise<{
        message: string;
    }>;
    getUsers(page?: number, limit?: number, search?: string): Promise<{
        users: import("../common/utils/sanitize-user.util").PublicUser[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateUser(id: string, body: any): Promise<import("../common/utils/sanitize-user.util").PublicUser>;
    getBookings(page?: number, limit?: number, status?: BookingStatus, destinationId?: string, userId?: string, from?: string, to?: string): Promise<{
        bookings: import("../bookings/entities/booking.entity").Booking[];
        total: number;
        page: number;
        limit: number;
    }>;
    getBookingById(id: string): Promise<import("../bookings/entities/booking.entity").Booking>;
    updateBookingStatus(id: string, status: BookingStatus, user: User): Promise<import("../bookings/entities/booking.entity").Booking>;
    getPayments(page?: string, limit?: string, status?: PaymentStatus, search?: string): Promise<{
        payments: import("../payments/entities/payment.entity").Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
    updatePaymentStatus(id: string, status: PaymentStatus): Promise<import("../payments/entities/payment.entity").Payment>;
    getRefundRequests(page?: string, limit?: string, status?: RefundRequestStatus): Promise<{
        requests: import("../payments/entities/refund-request.entity").RefundRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
    approveRefundRequest(id: string, admin: User): Promise<import("../payments/entities/refund-request.entity").RefundRequest>;
    rejectRefundRequest(id: string, admin: User, dto: RejectRefundDto): Promise<import("../payments/entities/refund-request.entity").RefundRequest>;
    createDestination(dto: CreateDestinationDto): Promise<import("../destinations/entities/destination.entity").Destination>;
    getDestinations(): Promise<{
        bookingCount: number;
        id: string;
        name: string;
        country: string;
        description: string;
        heroImageUrl: string;
        priceFromNgn: number;
        priceFromUsd: number;
        isFeatured: boolean;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        packages: import("../packages/entities/package.entity").Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }[]>;
    getDestination(id: string): Promise<{
        bookings: import("../bookings/entities/booking-item.entity").BookingItem[];
        totalPriceNgn: number;
        totalPriceUsd: number;
        id: string;
        name: string;
        country: string;
        description: string;
        heroImageUrl: string;
        priceFromNgn: number;
        priceFromUsd: number;
        isFeatured: boolean;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        packages: import("../packages/entities/package.entity").Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }>;
    updateDestination(id: string, dto: UpdateDestinationDto): Promise<{
        totalPriceNgn: number;
        totalPriceUsd: number;
        id: string;
        name: string;
        country: string;
        description: string;
        heroImageUrl: string;
        priceFromNgn: number;
        priceFromUsd: number;
        isFeatured: boolean;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        packages: import("../packages/entities/package.entity").Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }>;
    deleteDestination(id: string): Promise<{
        message: string;
    }>;
    createPackage(id: string, dto: CreatePackageDto): Promise<import("../packages/entities/package.entity").Package>;
    updatePackage(id: string, packageId: string, dto: UpdatePackageDto): Promise<import("../packages/entities/package.entity").Package>;
    deletePackage(id: string, packageId: string): Promise<{
        message: string;
    }>;
    uploadImage(file: Express.Multer.File, dto: UploadImageDto): Promise<import("../gallery/entities/gallery.entity").GalleryImage>;
    deleteImage(id: string): Promise<{
        message: string;
    }>;
    getContactSubmissions(page?: number, limit?: number): Promise<{
        submissions: import("../contact/entities/contact-submission.entity").ContactSubmission[];
        total: number;
        page: number;
        limit: number;
    }>;
    markContactRead(id: string): Promise<{
        message: string;
    }>;
}
