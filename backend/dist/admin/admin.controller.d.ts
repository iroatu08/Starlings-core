import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentsService } from '../payments/payments.service';
import { DestinationsService } from '../destinations/destinations.service';
import { PackagesService } from '../packages/packages.service';
import { GalleryService } from '../gallery/gallery.service';
import { ContactService } from '../contact/contact.service';
import { CreateDestinationDto } from '../destinations/dto/create-destination.dto';
import { UpdateDestinationDto } from '../destinations/dto/update-destination.dto';
import { CreatePackageDto } from '../packages/dto/create-package.dto';
import { UpdatePackageDto } from '../packages/dto/update-package.dto';
import { UploadImageDto } from '../gallery/dto/upload-image.dto';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
export declare class AdminController {
    private usersService;
    private bookingsService;
    private paymentsService;
    private destinationsService;
    private packagesService;
    private galleryService;
    private contactService;
    constructor(usersService: UsersService, bookingsService: BookingsService, paymentsService: PaymentsService, destinationsService: DestinationsService, packagesService: PackagesService, galleryService: GalleryService, contactService: ContactService);
    getUsers(page?: number, limit?: number, search?: string): Promise<{
        users: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            address: string;
            role: UserRole;
            isVerified: boolean;
            isActive: boolean;
            verificationToken: string;
            resetPasswordToken: string;
            resetPasswordExpires: Date;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateUser(id: string, body: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        role: UserRole;
        isVerified: boolean;
        isActive: boolean;
        resetPasswordExpires: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getBookings(page?: number, limit?: number, status?: BookingStatus): Promise<{
        bookings: import("../bookings/entities/booking.entity").Booking[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateBookingStatus(id: string, status: BookingStatus, user: User): Promise<import("../bookings/entities/booking.entity").Booking>;
    getPayments(page?: number, limit?: number): Promise<{
        payments: import("../payments/entities/payment.entity").Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
    createDestination(dto: CreateDestinationDto): Promise<import("../destinations/entities/destination.entity").Destination>;
    updateDestination(id: string, dto: UpdateDestinationDto): Promise<import("../destinations/entities/destination.entity").Destination>;
    deleteDestination(id: string): Promise<{
        message: string;
    }>;
    createPackage(dto: CreatePackageDto): Promise<import("../packages/entities/package.entity").Package>;
    updatePackage(id: string, dto: UpdatePackageDto): Promise<import("../packages/entities/package.entity").Package>;
    deletePackage(id: string): Promise<{
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
