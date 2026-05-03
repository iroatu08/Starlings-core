import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
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
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaymentStatus } from '../payments/entities/payment.entity';
import { RefundRequestStatus } from '../payments/entities/refund-request.entity';
import { RejectRefundDto } from '../payments/dto/reject-refund.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
    private bookingsService: BookingsService,
    private paymentsService: PaymentsService,
    private destinationsService: DestinationsService,
    private galleryService: GalleryService,
    private contactService: ContactService,
  ) {}

  // ─── STATS ─────────────────────────────────────────────
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ─── EMAIL ─────────────────────────────────────────────
  @Post('email/send')
  sendAdminEmail(@Body() dto: AdminSendEmailDto) {
    return this.adminService.sendEmail(dto);
  }

  // ─── USERS ─────────────────────────────────────────────
  @Get('users')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  getUsers(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.usersService.findAll(page, limit, search);
  }

  // ─── USERS ─────────────────────────────────────────────
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUserAdmin(id, body);
  }

  // ─── BOOKINGS ────────────────────────────────────────────
  @Get('bookings')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'destinationId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getBookings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: BookingStatus,
    @Query('destinationId') destinationId?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookingsService.findAll(page, limit, status, { destinationId, userId, from, to });
  }

  @Get('bookings/:id')
  getBookingById(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  // ─── BOOKINGS ────────────────────────────────────────────
  @Patch('bookings/:id/status')
  updateBookingStatus(@Param('id') id: string, @Body('status') status: BookingStatus, @GetUser() user: User) {
    return this.bookingsService.updateStatus(id, status, user);
  }

  // ─── PAYMENTS ────────────────────────────────────────────
  @Get('payments')
  getPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PaymentStatus,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.getAllPayments({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      search,
    });
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.paymentsService.updateStatus(id, status);
  }

  @Get('refund-requests')
  getRefundRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: RefundRequestStatus,
  ) {
    return this.paymentsService.getRefundRequests({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Patch('refund-requests/:id/approve')
  approveRefundRequest(@Param('id') id: string, @GetUser() admin: User) {
    return this.paymentsService.approveRefundRequest(id, admin);
  }

  @Patch('refund-requests/:id/reject')
  rejectRefundRequest(@Param('id') id: string, @GetUser() admin: User, @Body() dto: RejectRefundDto) {
    return this.paymentsService.rejectRefundRequest(id, admin, dto.reason);
  }

  // ─── DESTINATIONS ────────────────────────────────────────
  @Post('destinations')
  createDestination(@Body() dto: CreateDestinationDto) {
    return this.destinationsService.create(dto);
  }

  @Get('destinations')
  getDestinations() {
    return this.destinationsService.findAllAdmin();
  }

  @Get('destinations/:id')
  getDestination(@Param('id') id: string) {
    return this.destinationsService.findOneAdmin(id);
  }

  @Patch('destinations/:id')
  updateDestination(@Param('id') id: string, @Body() dto: UpdateDestinationDto) {
    return this.destinationsService.update(id, dto);
  }

  @Delete('destinations/:id')
  deleteDestination(@Param('id') id: string) {
    return this.destinationsService.remove(id);
  }

  // ─── PACKAGES ────────────────────────────────────────────
  @Post('destinations/:id/packages')
  createPackage(@Param('id') id: string, @Body() dto: CreatePackageDto) {
    return this.destinationsService.addPackage(id, dto);
  }

  @Patch('destinations/:id/packages/:packageId')
  updatePackage(@Param('id') id: string, @Param('packageId') packageId: string, @Body() dto: UpdatePackageDto) {
    return this.destinationsService.updatePackage(id, packageId, dto);
  }

  @Delete('destinations/:id/packages/:packageId')
  deletePackage(@Param('id') id: string, @Param('packageId') packageId: string) {
    return this.destinationsService.removePackage(id, packageId);
  }

  // ─── GALLERY ─────────────────────────────────────────────
  @Post('gallery/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadImageDto) {
    return this.galleryService.uploadImage(file, dto);
  }

  @Delete('gallery/:id')
  deleteImage(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

  // ─── CONTACT ─────────────────────────────────────────────
  @Get('contact')
  getContactSubmissions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.contactService.findAll(page, limit);
  }

  @Patch('contact/:id/read')
  markContactRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }
}
